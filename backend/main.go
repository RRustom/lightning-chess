package main

import (
	// "github.com/RRustom/lightning-chess/pkg/controllers"
	"fmt"
	"log"
	"net/http"

	"github.com/RRustom/lightning-chess/pkg/websocket"

	"github.com/RRustom/lightning-chess/pkg/controllers"
	"github.com/RRustom/lightning-chess/pkg/db"
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

// authentication middleware
func AuthRequired(c *gin.Context) {
	// read session token from cookie
	token, _ := c.Cookie("ln_chess_auth")

	// fetch session by token
	session, sessionExists := db.Sessions[token]

	// if doesn't exist, or expired, return error
	if !sessionExists || session.IsExpired() {
		// Abort the request with the appropriate error code
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	// Continue down the chain to handler etc
	c.Next()
}

func engine() *gin.Engine {
	router := gin.New()
	// router := gin.Default()

	// Login and logout routes
	router.POST("/api/lnd/connect", controllers.ConnectToNode)
	router.POST("/api/user/signup", controllers.PostNewUser)
	router.GET("/api/user/:id", controllers.GetUserById)
	router.GET("/api/game/:uuid", controllers.GetGameByUuid)

	// Private group, require authentication to access
	authorized := router.Group("/")
	authorized.Use(AuthRequired)
	{
		router.GET("/ws/move/game/:uuid", func(c *gin.Context) {
			gameUuid := c.Param("uuid")
			serveWs(c.Writer, c.Request, gameUuid)
		})

		router.GET("/api/game/moves/:uuid", controllers.GetValidMoves)

		// router.POST("/api/game/join", controllers.PostJoinGame)
		// router.POST("/api/game/move", controllers.PostMove)
		router.POST("/api/game/new", controllers.PostNewGame)

	}
	return router
}

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

	// router := gin.Default()
	router := engine()
	router.Use(gin.Logger())
	if err := engine().Run("localhost:8080"); err != nil {
		log.Fatal("Unable to start:", err)
	}
}
