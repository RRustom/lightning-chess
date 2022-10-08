package controllers

import (
	"context"
	"crypto/tls"
	"crypto/x509"
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

// store: a mapping from token to gRPC connection

// method: getRPC: token => gRPC connection

// method: connect to LND node: host, cert, macaroon => token, pubkey

// method: listen for payments

// LNDoptions are the options for the connection to the lnd node.
type LNDOptions struct {
	// Address of your LND node, including the port.
	// Optional ("localhost:10009" by default).
	Host string `json:"host"`
	// Path to the "tls.cert" file that your LND node uses.
	// Optional ("tls.cert" by default).
	Cert string `json:"cert"`
	// Path to the macaroon file that your LND node uses.
	// "invoice.macaroon" if you only use the GenerateInvoice() and CheckInvoice() methods
	// (required by the middleware in the package "wall").
	// "admin.macaroon" if you use the Pay() method (required by the client in the package "pay").
	// Optional ("invoice.macaroon" by default).
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
		fmt.Printf("NEW CLIENT: %+v\n", client)

		getInfoResponse, _ := client.LndClient.GetInfo(client.Ctx, &lnrpc.GetInfoRequest{})
		nodeId = getInfoResponse.LightningId
		fmt.Println("nodeId: ", nodeId)

		channelBalanceResponse, err := client.LndClient.ChannelBalance(client.Ctx, &lnrpc.ChannelBalanceRequest{})
		if err != nil {
			fmt.Println("ERROR: ", err)
		}
		fmt.Printf("BALANCE : %+v\n", channelBalanceResponse)

		db.Nodes[nodeId] = client

		// if new user, create user
		userId, err = db.GetUserByNodeID(nodeId)
		if err != nil {
			userId = db.CreateNewUser(getInfoResponse.IdentityAddress)
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
		fmt.Printf("EXISTING CLIENT: %+v\n", client)
		userId, _ = db.GetUserByNodeID(nodeId)
	}

	// getInfoResponse, _ := client.LndClient.GetInfo(client.Ctx, &lnrpc.GetInfoRequest{})

	// fmt.Printf("GET INFO: %+v\n", getInfoResponse)

	// walletBalanceResponse, _ := client.LndClient.WalletBalance(client.Ctx, &lnrpc.WalletBalanceRequest{})

	// fmt.Printf("WALLET BALANCE: %+v\n", walletBalanceResponse)

	// if exists {
	// 	c.IndentedJSON(http.StatusOK, g)
	// 	return
	// }

	user, _ := db.Users[userId]

	// c.String(http.StatusOK, "hello")
	c.IndentedJSON(http.StatusOK, LNDConnection{NodeId: nodeId, User: user})
	// c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game not found"})
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

	fmt.Printf("NODE: %+v\n", node)

	channelBalanceResponse, err := node.LndClient.ChannelBalance(node.Ctx, &lnrpc.ChannelBalanceRequest{})
	if err != nil {
		fmt.Println("ERROR: ", err)
	}

	fmt.Printf("BALANCE : %+v\n", channelBalanceResponse)

	c.IndentedJSON(http.StatusOK, channelBalanceResponse)
	return
}

// NewLNDclient creates a new LNDclient instance.
func NewLNDclient(lndOptions LNDOptions) (db.LNDClient, error) {
	result := db.LNDClient{}

	// lndOptions = assignLNDdefaultValues(lndOptions)

	decodedCert, err := hex.DecodeString(lndOptions.Cert)
	if err != nil {
		log.Fatal(err)
	}

	// Set up a connection to the server.
	creds, err := NewClientTLSFromString(string(decodedCert), "")
	if err != nil {
		return result, err
	}
	conn, err := grpc.Dial(lndOptions.Host, grpc.WithTransportCredentials(creds))
	if err != nil {
		return result, err
	}
	c := lnrpc.NewLightningClient(conn)

	// Add the macaroon to the outgoing context

	// macaroon, err := ioutil.ReadFile(lndOptions.MacaroonFile)
	// if err != nil {
	// 	return result, err
	// }
	// // Value must be the hex representation of the file content
	// macaroonHex := hex.EncodeToString(macaroon)
	ctx := context.Background()
	ctx = metadata.AppendToOutgoingContext(ctx, "macaroon", lndOptions.Macaroon)

	result = db.LNDClient{
		Conn:      conn,
		Ctx:       ctx,
		LndClient: c,
	}

	return result, nil
}

func NewClientTLSFromString(certString, serverNameOverride string) (credentials.TransportCredentials, error) {
	b := []byte(certString)
	cp := x509.NewCertPool()
	if !cp.AppendCertsFromPEM(b) {
		return nil, fmt.Errorf("credentials: failed to append certificates")
	}
	return credentials.NewTLS(&tls.Config{ServerName: serverNameOverride, RootCAs: cp}), nil
}

// // GenerateInvoice generates an invoice with the given price and memo.
// func (c LNDclient) GetInfo(amount int64, memo string) (Invoice, error) {
// 	result := Invoice{}

// 	// Create the request and send it
// 	invoice := lnrpc.Invoice{
// 		Memo:  memo,
// 		Value: amount,
// 	}
// 	stdOutLogger.Println("Creating invoice for a new API request")
// 	res, err := c.lndClient.AddInvoice(c.ctx, &invoice)
// 	if err != nil {
// 		return result, err
// 	}

// 	result.ImplDepID = hex.EncodeToString(res.RHash)
// 	result.PaymentHash = result.ImplDepID
// 	result.PaymentRequest = res.PaymentRequest
// 	return result, nil
// }

// // GenerateInvoice generates an invoice with the given price and memo.
// func (c LNDclient) GenerateInvoice(amount int64, memo string) (Invoice, error) {
// 	result := Invoice{}

// 	// Create the request and send it
// 	invoice := lnrpc.Invoice{
// 		Memo:  memo,
// 		Value: amount,
// 	}
// 	stdOutLogger.Println("Creating invoice for a new API request")
// 	res, err := c.lndClient.AddInvoice(c.ctx, &invoice)
// 	if err != nil {
// 		return result, err
// 	}

// 	result.ImplDepID = hex.EncodeToString(res.RHash)
// 	result.PaymentHash = result.ImplDepID
// 	result.PaymentRequest = res.PaymentRequest
// 	return result, nil
// }
