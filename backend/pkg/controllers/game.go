package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/RRustom/lightning-chess/pkg/db"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/notnil/chess"
)

type NewGameData struct {
	WhiteId int `json:"whiteId"`
}

type JoinGameData struct {
	Uuid    string `json:"uuid"`
	BlackId int    `json:"blackId"`
}

type MoveData struct {
	Uuid     string `json:"uuid"`
	PlayerId int    `json:"playerId"`
	Move     string `json:"move"`
}

type GamePositionData struct {
	Fen     string `json:"fen"`
	Outcome string `json:"outcome"`
	NumTurn int    `json:"numTurn"`
}

type ValidMovesData struct {
	Moves []string `json:"moves"`
}

type GameWonData struct {
	Preimage string     `json:"preimage"`
	Invoice  db.Invoice `json:"invoice"`
}

func getGamePositionData(g db.Game, game *chess.Game) GamePositionData {
	fen := game.Position().String()
	turns := len(g.Positions) - 1
	return GamePositionData{Fen: fen, Outcome: game.Outcome().String(), NumTurn: turns}
}

// POST a new game (whiteID) -> return game uuid
func PostNewGame(c *gin.Context) {
	var data NewGameData

	if err := c.BindJSON(&data); err != nil {
		fmt.Println(err)
		return
	}

	g := chess.NewGame()

	positions := []string{g.Position().String()}

	newGame := db.Game{
		Uuid:      uuid.New(),
		WhiteId:   data.WhiteId,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Positions: positions,
	}
	db.Games[newGame.Uuid] = newGame

	newGamePayment := db.GamePayment{
		GameUuid: newGame.Uuid,
	}
	db.GamePayments[newGame.Uuid] = newGamePayment

	c.String(http.StatusCreated, newGame.Uuid.String())
}

// GET game by uuid -> return FEN + outcome
func GetGameByUuid(c *gin.Context) {
	uuidString := c.Param("uuid")
	uuid, _ := uuid.Parse(uuidString)

	g, exists := db.Games[uuid]

	if exists {
		c.IndentedJSON(http.StatusOK, g)
		return
	}

	c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game not found"})
}

func GetValidMoves(c *gin.Context) {
	uuidString := c.Param("uuid")
	uuid, _ := uuid.Parse(uuidString)

	g, exists := db.Games[uuid]

	if !exists {
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game not found"})
		return
	}

	game := g.GetLatestPosition()
	validMoves := game.ValidMoves()

	var movesUCI []string

	for _, validMove := range validMoves {
		moveUCI := chess.UCINotation.Encode(chess.UCINotation{}, game.Position(), validMove)
		movesUCI = append(movesUCI, moveUCI)
	}

	c.IndentedJSON(http.StatusOK, ValidMovesData{Moves: movesUCI})
	return
}

func JoinGame(data JoinGameData) ([]byte, error) {
	uuid, _ := uuid.Parse(data.Uuid)

	g, exists := db.Games[uuid]
	if exists {
		g.BlackId = data.BlackId
		db.Games[uuid] = g

		u, err := json.Marshal(JoinGameData{BlackId: data.BlackId})
		if err != nil {
			panic(err)
		}
		return u, nil
	}

	return []byte{}, errors.New("game not found")
}

func MakeMove(data MoveData) ([]byte, error) {
	uuid, _ := uuid.Parse(data.Uuid)

	g, exists := db.Games[uuid]
	if !exists {
		return []byte{}, errors.New("game not found")
	}

	_, userExists := db.Users[data.PlayerId]
	if !userExists {
		return []byte{}, errors.New("user not found")
	}

	isCorrectPlayer, err := g.IsPlayerIdTurn(data.PlayerId)
	if !isCorrectPlayer || err != nil {
		return []byte{}, errors.New("not your turn!")
	}

	game := g.GetLatestPosition()

	fmt.Println("game outcome: ", game.Outcome())
	fmt.Println(game.String())

	// check if game did not already reach an outcome
	if game.Outcome() != chess.NoOutcome {
		return []byte{}, errors.New("game is no longer active")
	}

	// make move using UCI notation
	if err := game.MoveStr(data.Move); err != nil {
		fmt.Println(err)
	}
	fen := game.Position().String()
	g.Positions = append(g.Positions, fen)
	db.Games[uuid] = g

	positionData := getGamePositionData(g, game)

	u, err := json.Marshal(positionData)
	if err != nil {
		panic(err)
	}

	return u, nil
}

// GET invoice to start the game
func GetStartInvoice(c *gin.Context) {
	uuidString := c.Param("uuid")
	gameUuid, _ := uuid.Parse(uuidString)

	game, exists := db.Games[gameUuid]

	if !exists {
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game not found"})
		return
	}

	// read session token from cookie
	token, _ := c.Cookie("ln_chess_auth")

	// fetch session by token
	session, _ := db.Sessions[token]

	nodeId := session.NodeId
	userId, _ := db.GetUserByNodeID(nodeId)

	client := db.LNDBackend
	memo := fmt.Sprintf("%v", uuidString)

	invoice, err := GenerateInvoice(client, 1000, memo)
	if err != nil {
		fmt.Println("error generating invoice: ", err)
	}

	// update GamePayment invoice
	gp := db.GamePayments[gameUuid]
	if userId == game.WhiteId {
		gp.WhiteInvoice = invoice
	} else {
		gp.BlackInvoice = invoice
	}
	db.GamePayments[gameUuid] = gp

	c.IndentedJSON(http.StatusOK, invoice)
	return
}

func PayWinner(c *gin.Context) {
	uuidString := c.Param("uuid")
	gameUuid, _ := uuid.Parse(uuidString)

	g, exists := db.Games[gameUuid]

	if !exists {
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game not found"})
		return
	}

	// fetch userId from cookie
	token, _ := c.Cookie("ln_chess_auth")
	session, _ := db.Sessions[token]
	nodeId := session.NodeId
	userId, _ := db.GetUserByNodeID(nodeId)

	// get winnerId
	game := g.GetLatestPosition()
	outcome := game.Outcome()
	var winnerId int
	if outcome != chess.NoOutcome {
		if outcome == chess.WhiteWon {
			winnerId = g.WhiteId
		} else if outcome == chess.BlackWon {
			winnerId = g.BlackId
		}
	} else {
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game is not over"})
		return
	}

	if winnerId != userId {
		c.IndentedJSON(http.StatusForbidden, gin.H{"message": "you are not the winner"})
		return
	}

	client := db.Nodes[nodeId]
	memo := fmt.Sprintf("Congrats on winning game %v!", gameUuid.String())

	invoice, err := GenerateInvoice(client, 2000, memo)
	if err != nil {
		fmt.Println("error generating invoice: ", err)
	}

	preimage, err := Pay(db.LNDBackend, invoice.PaymentRequest)
	if err != nil {
		fmt.Println("error paying winner: ", err)
	}

	c.IndentedJSON(http.StatusOK, GameWonData{Preimage: preimage, Invoice: invoice})
	return
}
