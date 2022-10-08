package db

import (
	"context"
	"time"

	"github.com/lightningnetwork/lnd/lnrpc"
	"google.golang.org/grpc"
)

type LNDNode struct {
	Host     string
	Cert     string
	Macaroon string
}

// LNDclient is an implementation of the wall.LNClient and pay.LNClient interface
// for the lnd Lightning Network node implementation.
type LNDClient struct {
	LndClient lnrpc.LightningClient
	Ctx       context.Context
	Conn      *grpc.ClientConn
}

// Invoice is a Lightning Network invoice and contains the typical invoice string and the payment hash.
type Invoice struct {
	// The unique identifier for the invoice in the LN node.
	// The value depends on the LN node implementation.
	//
	// For example, lnd uses the payment hash (a.k.a. preimage hash) as ID.
	// It doesn't use this term ("ID"), but when fetching a single invoice via RPC,
	// the payment hash is used as identifier.
	// Also, Lightning Lab's (creators of lnd) desktop app "Lightning" explicitly shows
	// the payment hash in a field with the title "invoice ID" in the Lightning transaction overview.
	//
	// But Lightning Charge on the other hand generates its own timestamp-based ID for each invoice.
	// They explicitly call that value "invoice ID" and they also require it when fetching a single invoice
	// via Lightning Charge's RESTful API.
	ImplDepID string `json:"invoiceId"`
	// A.k.a. preimage hash. Hex encoded.
	// Could be extracted from the PaymentRequest, but that would require additional
	// dependencies during build time and additional computation during runtime,
	// while all Lightning Node implementation clients already return the value directly
	// when generating an invoice.
	PaymentHash string `json:"paymentHash"`
	// The actual invoice string required by the payer in Bech32 encoding,
	// see https://github.com/lightningnetwork/lightning-rfc/blob/master/11-payment-encoding.md
	PaymentRequest string `json:"paymentRequest"`
}

type NodeSession struct {
	NodeId string
	Expiry time.Time
}

func (s NodeSession) IsExpired() bool {
	return s.Expiry.Before(time.Now())
}

// token to Node session
var Sessions = make(map[string]NodeSession)

// node ID to LNDClient
var Nodes = make(map[string]LNDClient)

// backend node
var LNDBackend LNDClient
