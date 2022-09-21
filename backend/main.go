package main

import (
	// "github.com/RRustom/lightning-chess/pkg/controllers"
	"fmt"
	"log"
	"net/http"

	"github.com/RRustom/lightning-chess/pkg/websocket"

	"github.com/RRustom/lightning-chess/pkg/controllers"
	"github.com/gin-gonic/gin"
)

// define websocket endpoint
// func serveWs(pool *websocket.Pool, w http.ResponseWriter, r *http.Request) {
// 	fmt.Println("host: ", r.Host)

// 	// upgrade HTTP connection to a WS connection
// 	conn, err := websocket.Upgrade(w, r)
// 	if err != nil {
// 		log.Println(err)
// 	}

// 	client := &websocket.Client{
// 		Conn: conn,
// 		Pool: pool,
// 	}

// 	pool.Register <- client
// 	client.Read()
// }

// func setupRoutes() {
// 	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
// 		fmt.Fprintf(w, "Simple Server")
// 	})

// 	pool := websocket.NewPool()
// 	go pool.Start()

// 	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
// 		serveWs(pool, w, r)
// 	})
// }

// serveWs handles websocket requests from the peer.
func serveWs(w http.ResponseWriter, r *http.Request, gameUuid string) {
	fmt.Println("Connection to gameUuid: ", gameUuid)
	ws, err := websocket.Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err.Error())
		return
	}
	c := &websocket.Connection{Send: make(chan []byte, 256), Ws: ws}
	s := websocket.Subscription{Conn: c, Room: gameUuid}
	websocket.LocalHub.Register <- s

	go s.WritePump()
	go s.ReadPump()
}

func main() {
	// setupRoutes()
	// http.ListenAndServe(":8000", nil)
	go websocket.LocalHub.Run()

	router := gin.Default()

	router.GET("/ws/move/game/:uuid", func(c *gin.Context) {
		gameUuid := c.Param("uuid")
		serveWs(c.Writer, c.Request, gameUuid)
	})

	// router.Use(sessions.Sessions("session", cookie.NewStore(globals.Secret)))

	// private := router.Group("/")
	// private.Use(middleware.AuthRequired)
	// routes.PrivateRoutes(private)

	router.GET("/api/game/moves/:uuid", controllers.GetValidMoves)
	router.GET("/api/game/:uuid", controllers.GetGameByUuid)
	// router.POST("/api/game/join", controllers.PostJoinGame)
	// router.POST("/api/game/move", controllers.PostMove)
	router.POST("/api/game/new", controllers.PostNewGame)
	router.POST("/api/user/signup", controllers.PostNewUser)

	router.Run("localhost:8080")
}
