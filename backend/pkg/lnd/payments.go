package lnd

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"

	"github.com/RRustom/lightning-chess/pkg/db"
	"github.com/RRustom/lightning-chess/pkg/websocket"
	"github.com/google/uuid"
	"github.com/lightningnetwork/lnd/lnrpc"
)

type PaymentUpdateData struct {
	PlayerId     int    `json:"playerId"`  // id of the player that settled the invoice
	InvoiceId    string `json:"invoiceId"` // hex-encoded
	CanStartGame bool   `json:"canStartGame"`
}

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

		uuidString := invoice.GetMemo()
		gameUuid, _ := uuid.Parse(uuidString)

		invoiceState := invoice.GetState()
		invoiceId := hex.EncodeToString(invoice.RHash)

		if invoiceState == lnrpc.Invoice_SETTLED {
			fmt.Println("INVOICE WAS SETTLED: ", invoice)
			// update GamePayment invoice
			var playerId int
			canStartGame := false
			g := db.Games[gameUuid]
			gp := db.GamePayments[gameUuid]

			if invoiceId == gp.WhiteInvoice.ImplDepID {
				playerId = g.WhiteId
				gp.DidWhitePay = true
			} else if invoiceId == gp.BlackInvoice.ImplDepID {
				playerId = g.BlackId
				gp.DidBlackPay = true
			}

			if gp.DidBlackPay && gp.DidWhitePay {
				canStartGame = true
			}

			db.GamePayments[gameUuid] = gp

			u, _ := json.Marshal(PaymentUpdateData{PlayerId: playerId, InvoiceId: invoiceId, CanStartGame: canStartGame})
			message := websocket.Message{Data: u, Room: uuidString}

			connections.Broadcast <- message
		}
	}
}
