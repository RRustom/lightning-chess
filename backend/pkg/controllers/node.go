package controllers

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/metadata"

	"encoding/hex"

	"github.com/RRustom/lightning-chess/pkg/db"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lightningnetwork/lnd/lnrpc"
)

type LNDOptions struct {
	// Address of LND node, including the port.
	// Ex: ("localhost:10009").
	Host string `json:"host"`
	// Hex encoding of tls.cert used by LND node
	Cert string `json:"cert"`
	// Hex encoding of macaroon giving certain permissions
	Macaroon string `json:"macaroon"`
}

type LNDConnection struct {
	NodeId string  `json:"nodeId"`
	User   db.User `json:"user"`
}

// POST connect to a node
func ConnectToNode(c *gin.Context) {
	var data LNDOptions

	if err := c.BindJSON(&data); err != nil {
		fmt.Println(err)
		return
	}

	// read session token from cookie
	token, _ := c.Cookie("ln_chess_auth")

	// fetch session by token
	session, sessionExists := db.Sessions[token]
	var client db.LNDClient
	var err error
	var userId int
	var nodeId string

	// if doesn't exist, or expired, create a new session
	if !sessionExists || session.IsExpired() {
		token := strings.Replace(uuid.NewString(), "-", "", -1)
		fmt.Println("token: ", token)
		expiresAt := time.Now().Add(24 * time.Hour)

		client, err = NewLNDclient(data)
		if err != nil {
			log.Println(err.Error())
			c.IndentedJSON(http.StatusBadRequest, gin.H{"message": "client couldn't connect"})
			return
		}
		getInfoResponse, _ := client.LndClient.GetInfo(client.Ctx, &lnrpc.GetInfoRequest{})
		nodeId = getInfoResponse.IdentityPubkey

		db.Nodes[nodeId] = client

		// if new user, create user
		userId, err = db.GetUserByNodeID(nodeId)
		if err != nil {
			userId = db.CreateNewUser(getInfoResponse.Alias)
		}

		// update the user's node
		db.UserNodes[userId] = nodeId

		newSession := db.NodeSession{NodeId: nodeId, Expiry: expiresAt}
		db.Sessions[token] = newSession

		// update cookie
		maxAge := 86400 // 24 hours
		c.SetCookie("ln_chess_auth", token, maxAge, "/", "localhost", false, true)
	} else {
		// retrieve client
		nodeId = session.NodeId
		client = db.Nodes[nodeId]
		userId, _ = db.GetUserByNodeID(nodeId)
	}

	user, _ := db.Users[userId]

	c.IndentedJSON(http.StatusOK, LNDConnection{NodeId: nodeId, User: user})
	return
}

// GET connection data from cookie
func Authenticate(c *gin.Context) {
	// read session token from cookie
	token, _ := c.Cookie("ln_chess_auth")

	// fetch session by token
	session, sessionExists := db.Sessions[token]

	// if doesn't exist, or expired, create a new session
	if !sessionExists || session.IsExpired() {
		c.IndentedJSON(http.StatusOK, LNDConnection{})
		return
	} else {
		// retrieve client
		nodeId := session.NodeId
		userId, _ := db.GetUserByNodeID(nodeId)
		user := db.Users[userId]

		c.IndentedJSON(http.StatusOK, LNDConnection{NodeId: session.NodeId, User: user})
		return
	}
}

// GET wallet balance
func GetWalletBalance(c *gin.Context) {
	// read session token from cookie
	token, _ := c.Cookie("ln_chess_auth")

	// fetch session by token
	session, _ := db.Sessions[token]

	node, _ := db.Nodes[session.NodeId]

	walletBalanceResponse, err := node.LndClient.ChannelBalance(node.Ctx, &lnrpc.ChannelBalanceRequest{})
	if err != nil {
		fmt.Println("ERROR: ", err)
	}

	c.IndentedJSON(http.StatusOK, walletBalanceResponse)
	return
}

// NewLNDclient creates a new LNDclient instance.
func NewLNDclient(lndOptions LNDOptions) (db.LNDClient, error) {
	result := db.LNDClient{}

	decodedCert, err := hex.DecodeString(lndOptions.Cert)
	if err != nil {
		log.Fatal(err)
	}

	// Set up a connection to the server.
	creds, err := newClientTLSFromString(string(decodedCert), "")
	if err != nil {
		return result, err
	}
	conn, err := grpc.Dial(lndOptions.Host, grpc.WithTransportCredentials(creds))
	if err != nil {
		return result, err
	}
	c := lnrpc.NewLightningClient(conn)

	// Add the macaroon to the outgoing context
	ctx := context.Background()
	ctx = metadata.AppendToOutgoingContext(ctx, "macaroon", lndOptions.Macaroon)

	result = db.LNDClient{
		Conn:      conn,
		Ctx:       ctx,
		LndClient: c,
	}

	return result, nil
}

// GenerateInvoice generates an invoice with the given price and memo.
func GenerateInvoice(client db.LNDClient, amount int64, memo string) (db.Invoice, error) {
	result := db.Invoice{}

	// Create the request and send it
	invoice := lnrpc.Invoice{
		Memo:  memo,
		Value: amount,
	}
	fmt.Println("Creating invoice with memo: ", memo)
	res, err := client.LndClient.AddInvoice(client.Ctx, &invoice)
	if err != nil {
		fmt.Println("Error generating invoice: ", err)
		return result, err
	}

	result.ImplDepID = hex.EncodeToString(res.RHash)
	result.PaymentHash = result.ImplDepID
	result.PaymentRequest = res.PaymentRequest
	return result, nil
}

// Pay pays the invoice and returns the preimage (hex encoded) on success, or an error on failure.
func Pay(client db.LNDClient, invoice string) (string, error) {
	// Decode payment request (a.k.a. invoice).
	payReqString := lnrpc.PayReqString{
		PayReq: invoice,
	}
	decodedPayReq, err := client.LndClient.DecodePayReq(client.Ctx, &payReqString)
	if err != nil {
		return "", err
	}

	// Send payment
	sendReq := lnrpc.SendRequest{
		PaymentRequest: invoice,
	}
	fmt.Printf("Sending payment with %v Satoshis to %v (memo: \"%v\")",
		decodedPayReq.NumSatoshis, decodedPayReq.Destination, decodedPayReq.Description)
	sendRes, err := client.LndClient.SendPaymentSync(client.Ctx, &sendReq)
	if err != nil {
		return "", err
	}
	// Even if err is nil, this just means the RPC call was successful, not the payment was successful
	if sendRes.PaymentError != "" {
		return "", errors.New(sendRes.PaymentError)
	}

	hexPreimage := hex.EncodeToString(sendRes.PaymentPreimage)
	return string(hexPreimage), nil
}

func newClientTLSFromString(certString, serverNameOverride string) (credentials.TransportCredentials, error) {
	b := []byte(certString)
	cp := x509.NewCertPool()
	if !cp.AppendCertsFromPEM(b) {
		return nil, fmt.Errorf("credentials: failed to append certificates")
	}
	return credentials.NewTLS(&tls.Config{ServerName: serverNameOverride, RootCAs: cp}), nil
}
