package websocket

type Message struct {
	Data []byte
	Room string
}

type Subscription struct {
	Conn *Connection
	Room string
}

// hub maintains the set of active connections and broadcasts Messages to the
// connections.
type Hub struct {
	// Registered connections.
	Rooms map[string]map[*Connection]bool

	// Inbound Messages from the connections.
	Broadcast chan Message

	// Register requests from the connections.
	Register chan Subscription

	// Unregister requests from connections.
	Unregister chan Subscription
}

var LocalHub = Hub{
	Broadcast:  make(chan Message),
	Register:   make(chan Subscription),
	Unregister: make(chan Subscription),
	Rooms:      make(map[string]map[*Connection]bool),
}

func (h *Hub) Run() {
	for {
		select {
		case s := <-h.Register:
			connections := h.Rooms[s.Room]
			if connections == nil {
				connections = make(map[*Connection]bool)
				h.Rooms[s.Room] = connections

			}
			h.Rooms[s.Room][s.Conn] = true
		case s := <-h.Unregister:
			connections := h.Rooms[s.Room]
			if connections != nil {
				if _, ok := connections[s.Conn]; ok {
					delete(connections, s.Conn)
					close(s.Conn.Send)
					if len(connections) == 0 {
						delete(h.Rooms, s.Room)
					}
				}
			}
		case m := <-h.Broadcast:
			connections := h.Rooms[m.Room]
			for c := range connections {
				select {
				case c.Send <- m.Data:
				default:
					close(c.Send)
					delete(connections, c)
					if len(connections) == 0 {
						delete(h.Rooms, m.Room)
					}
				}
			}
		}
	}
}
