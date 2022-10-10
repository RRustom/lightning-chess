package websocket

import (
	"log"
	"net/http"
	"time"

	"github.com/RRustom/lightning-chess/pkg/controllers"
	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var Upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true }, // TODO: make this secure
}

// connection is an middleman between the websocket connection and the hub.
type Connection struct {
	// The websocket connection.
	Ws *websocket.Conn

	// Buffered channel of outbound messages.
	Send chan []byte
}

type MessageName string

const (
	OpponentJoined MessageName = "opponent_join"
	NewMove                    = "new_move"
	Outcome                    = "outcome"
)

type IncomingMessage struct {
	Name     MessageName              `json:"name"`
	Move     controllers.MoveData     `json:"moveData"`
	JoinGame controllers.JoinGameData `json:"joinGameData"`
}

// readPump pumps messages from the websocket connection to the hub.
// f is an arbitrary controller method
func (s Subscription) ReadPump() {
	c := s.Conn
	defer func() {
		LocalHub.Unregister <- s
		c.Ws.Close()
	}()
	c.Ws.SetReadLimit(maxMessageSize)
	c.Ws.SetReadDeadline(time.Now().Add(pongWait))
	c.Ws.SetPongHandler(func(string) error { c.Ws.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {

		var message IncomingMessage

		if err := c.Ws.ReadJSON(&message); err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("error: %v", err)
			}
			break
		}

		m := Message{Room: s.Room}
		var outputData []byte
		var err error

		switch message.Name {
		case NewMove:
			outputData, err = controllers.MakeMove(message.Move)
		case OpponentJoined:
			outputData, err = controllers.JoinGame(message.JoinGame)
		}
		m.Data = outputData

		if err != nil {
			log.Printf("error: %v\n", err)
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("error: %v", err)
			}
			break
		}

		LocalHub.Broadcast <- m
	}
}

// write writes a message with the given message type and payload.
func (c *Connection) write(mt int, payload []byte) error {
	c.Ws.SetWriteDeadline(time.Now().Add(writeWait))
	return c.Ws.WriteMessage(mt, payload)
}

// writePump pumps messages from the hub to the websocket connection.
func (s *Subscription) WritePump() {
	c := s.Conn
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Ws.Close()
	}()
	for {
		select {
		case message, ok := <-c.Send:
			if !ok {
				c.write(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.write(websocket.TextMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			if err := c.write(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}
}
