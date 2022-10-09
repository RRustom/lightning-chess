package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	// "strconv"

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
	// game := g.getGameLatestPosition()
	fen := game.Position().String()
	turns := len(g.Positions) - 1
	return GamePositionData{Fen: fen, Outcome: game.Outcome().String(), NumTurn: turns}
}

// TODO: calculate turn # from PGN

// // getGames responds with the list of all Games as JSON.
// func GetGames(c *gin.Context) {
// 	c.IndentedJSON(http.StatusOK, games) // c.JSON() is more compact
// }

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
		// Pgn:       fmt.Sprint(g),
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

	// moves, _ := json.Marshal(validMoves)
	c.IndentedJSON(http.StatusOK, ValidMovesData{Moves: movesUCI})
	return
}

// PUT join a game (gameUuid, blackId) -> return FEN + outcome (if any)
//
//	-> then broadcast the FEN + the other's players valid moves + outcome (if any)
func JoinGame(data JoinGameData) ([]byte, error) {
	// var data JoinGameData

	// if err := c.BindJSON(&data); err != nil {
	// 	fmt.Println(err)
	// 	return
	// }

	uuid, _ := uuid.Parse(data.Uuid)

	g, exists := db.Games[uuid]
	if exists {
		g.BlackId = data.BlackId
		db.Games[uuid] = g

		// positionData := g.getGamePositionData()

		u, err := json.Marshal(JoinGameData{BlackId: data.BlackId})
		if err != nil {
			panic(err)
		}
		return u, nil
		// c.IndentedJSON(http.StatusOK, positionData)
		// var outputData bytes.Buffer        // Stand-in for a network connection
		// enc := gob.NewEncoder(&outputData) // Will write to network.
		// // dec := gob.NewDecoder(&network) // Will read from network.
		// // Encode (send) the value.
		// err := enc.Encode(positionData)
		// if err != nil {
		// 	log.Fatal("encode error:", err)
		// }

		// // c.IndentedJSON(http.StatusOK, positionData)
		// return outputData.Bytes(), nil
	}

	return []byte{}, errors.New("game not found")

	// c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game not found"})
}

// PUT make a move (game uuid, playerID, move (in algebraic notation)) -> return FEN + outcome (if any)
//
//	-> then broadcast the FEN + the other's players valid moves + outcome (if any)
func MakeMove(data MoveData) ([]byte, error) {
	// var data MoveData

	// if err := c.ReadJSON(&data); err != nil {
	// 	fmt.Println(err)
	// 	return []byte{}, err
	// }

	uuid, _ := uuid.Parse(data.Uuid)
	// playerId, _ := strconv.Atoi(c.Param("playerId"))
	// move := c.Param("move")

	g, exists := db.Games[uuid]
	if !exists {
		// c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game not found"})
		return []byte{}, errors.New("game not found")
	}

	_, userExists := db.Users[data.PlayerId]
	if !userExists {
		// c.IndentedJSON(http.StatusNotFound, gin.H{"message": "user not found"})
		return []byte{}, errors.New("user not found")
	}

	isCorrectPlayer, err := g.IsPlayerIdTurn(data.PlayerId)
	if !isCorrectPlayer || err != nil {
		// c.IndentedJSON(http.StatusNotFound, gin.H{"message": "not your turn!"})
		return []byte{}, errors.New("not your turn!")
	}

	game := g.GetLatestPosition()

	fmt.Println("game outcome: ", game.Outcome())
	fmt.Println(game.String())

	// check if game did not already reach an outcome
	if game.Outcome() != chess.NoOutcome {
		// c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game is no longer active"})
		return []byte{}, errors.New("game is no longer active")
	}

	// convert UCI notation move to algebraic notation

	// make move using UCI notation
	if err := game.MoveStr(data.Move); err != nil {
		// handle error
		fmt.Println(err)
	}
	// g.Pgn = fmt.Sprint(game)
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
