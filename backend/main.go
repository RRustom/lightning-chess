package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/RRustom/lightning-chess/pkg/controllers"
	"github.com/RRustom/lightning-chess/pkg/websocket"
	"github.com/gin-gonic/gin"
)

// define websocket endpoint
func serveWs(pool *websocket.Pool, w http.ResponseWriter, r *http.Request) {
	fmt.Println("host: ", r.Host)

	// upgrade HTTP connection to a WS connection
	conn, err := websocket.Upgrade(w, r)
	if err != nil {
		log.Println(err)
	}

	client := &websocket.Client{
		Conn: conn,
		Pool: pool,
	}

	pool.Register <- client
	client.Read()
}

func setupRoutes() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Simple Server")
	})

	pool := websocket.NewPool()
	go pool.Start()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(pool, w, r)
	})
}

func main() {
	// setupRoutes()
	// http.ListenAndServe(":8000", nil)

	router := gin.Default()

	// router.Use(sessions.Sessions("session", cookie.NewStore(globals.Secret)))

	// private := router.Group("/")
	// private.Use(middleware.AuthRequired)
	// routes.PrivateRoutes(private)

	router.GET("/api/game/moves/:uuid", controllers.GetValidMoves)
	router.GET("/api/game/:uuid", controllers.GetGameByUuid)
	router.POST("/api/game/join", controllers.PostJoinGame)
	router.POST("/api/game/move", controllers.PostMove)
	router.POST("/api/game/new", controllers.PostNewGame)
	router.POST("/api/user/signup", controllers.PostNewUser)

	router.Run("localhost:8080")
}
