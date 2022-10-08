package lnd

import (
	"encoding/json"
	"fmt"
	"io"
	"log"

	"github.com/RRustom/lightning-chess/pkg/db"
	"github.com/RRustom/lightning-chess/pkg/websocket"
	"github.com/lightningnetwork/lnd/lnrpc"
)

func ListenForPayments(connections websocket.Hub) {
	client := db.LNDBackend

	stream, err := client.LndClient.SubscribeInvoices(client.Ctx, &lnrpc.InvoiceSubscription{})
	if err != nil {
		fmt.Println("ERROR while streaming: ", err)
	}
	for {
		invoice, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatalf("%v.ListFeatures(_) = _, %v", client, err)
		}
		fmt.Println("INVOICE WAS SETTLED: ", invoice)

		u, _ := json.Marshal(invoice)

		gameUuid := invoice.Memo

		message := websocket.Message{Data: u, Room: gameUuid}

		// TODO: update game payments

		connections.Broadcast <- message
	}
}
