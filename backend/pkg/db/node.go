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
	lndClient lnrpc.LightningClient
	ctx       context.Context
	conn      *grpc.ClientConn
}

type NodeSession struct {
	NodeID string
	Expiry time.Time
}

func (s NodeSession) IsExpired() bool {
	return s.Expiry.Before(time.Now())
}

// token to Node session
var Sessions = make(map[string]NodeSession)

// node ID to Node mapping
var Nodes = make(map[string]LNDNode)
