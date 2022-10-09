package main

import (
	// "github.com/RRustom/lightning-chess/pkg/controllers"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/RRustom/lightning-chess/pkg/controllers"
	"github.com/RRustom/lightning-chess/pkg/db"
	"github.com/RRustom/lightning-chess/pkg/lnd"
	"github.com/RRustom/lightning-chess/pkg/websocket"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// authentication middleware
func authRequired(c *gin.Context) {
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
	router.POST("/api/auth/connect", controllers.ConnectToNode)
	router.GET("/api/auth/authenticate", controllers.Authenticate)
	router.POST("/api/user/signup", controllers.PostNewUser)
	router.GET("/api/user/:id", controllers.GetUserById)
	router.GET("/api/game/:uuid", controllers.GetGameByUuid)

	// Private group, require authentication to access
	authorized := router.Group("/")
	authorized.Use(authRequired)
	{
		router.GET("/ws/game/:uuid", func(c *gin.Context) {
			gameUuid := c.Param("uuid")
			serveWs(c.Writer, c.Request, gameUuid)
		})

		router.GET("/api/user/balance", controllers.GetWalletBalance)

		router.GET("/api/game/winingInvoice/:uuid", controllers.PayWinner)

		router.GET("/api/game/startInvoice/:uuid", controllers.GetStartInvoice)

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

// connect to our backend LND node
// listen to payments made, and broadcast them to WS connections
func connectToLND() {
	options := controllers.LNDOptions{
		Host:     os.Getenv("LND_HOST"),
		Cert:     os.Getenv("LND_CERT"),
		Macaroon: os.Getenv("LND_MACAROON"),
	}

	client, err := controllers.NewLNDclient(options)
	if err != nil {
		log.Fatal("Error connecting to LND backend")
	}

	db.LNDBackend = client

	go lnd.ListenForPayments(websocket.LocalHub)
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	go websocket.LocalHub.Run()

	connectToLND()

	router := engine()
	router.Use(gin.Logger())
	if err := engine().Run("localhost:8080"); err != nil {
		log.Fatal("Unable to start:", err)
	}
}
