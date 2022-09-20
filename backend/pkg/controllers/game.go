package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/notnil/chess"
)

type Game struct {
	Uuid      uuid.UUID `json:"uuid"`
	Pgn       string    `json:"pgn"`     // PGN format for the whole game, with metadata
	WhiteId   int       `json:"whiteId"` // white player ID
	BlackId   int       `json:"blackId"` // black player ID
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type NewGameData struct {
	WhiteId int `json:"whiteId"`
}

type GamePositionData struct {
	Fen     string `json:"fen"`
	Outcome string `json:"outcome"`
}

type ValidMovesData struct {
	Moves []string `json:"moves"`
}

func (g *Game) getGameFromPGN() *chess.Game {
	pgnReader := strings.NewReader(g.Pgn)
	pgn, err := chess.PGN(pgnReader)
	if err != nil {
		fmt.Println(err)
	}
	return chess.NewGame(pgn) // chess.UseNotation(chess.AlgebraicNotation{}) chess.UseNotation(chess.UCINotation{})
}

func (g *Game) getGamePositionData() GamePositionData {
	game := g.getGameFromPGN()
	fen := game.Position().String()
	return GamePositionData{Fen: fen, Outcome: game.Outcome().String()}
}

func (g *Game) isPlayerIdTurn(playerId int) (bool, error) {
	game := g.getGameFromPGN()
	moves := game.Moves()
	turns := len(moves)

	if playerId == g.BlackId {
		return turns%2 == 0, nil
	} else if playerId == g.WhiteId {
		return turns%2 == 1, nil
	}

	return false, errors.New("player is not part of the game")
}

// rudimentary storage
var games = make(map[uuid.UUID]Game)

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

	newGame := Game{
		Uuid:      uuid.New(),
		WhiteId:   data.WhiteId,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Pgn:       "",
	}
	games[newGame.Uuid] = newGame

	c.String(http.StatusCreated, newGame.Uuid.String())
}

// GET game by uuid -> return FEN + outcome
func GetGameByUuid(c *gin.Context) {
	uuidString := c.Param("uuid")
	uuid, _ := uuid.Parse(uuidString)

	g, exists := games[uuid]

	if exists {
		positionData := g.getGamePositionData()
		c.IndentedJSON(http.StatusOK, positionData)
		return
	}

	c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game not found"})
}

func GetValidMoves(c *gin.Context) {
	uuidString := c.Param("uuid")
	uuid, _ := uuid.Parse(uuidString)

	g, exists := games[uuid]

	if !exists {
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game not found"})
		return
	}

	game := g.getGameFromPGN()
	validMoves := game.ValidMoves()
	fmt.Println("validMoves: ", validMoves)

	var movesUCI []string

	for _, validMove := range validMoves {
		moveUCI := chess.UCINotation.Encode(chess.UCINotation{}, game.Position(), validMove)
		movesUCI = append(movesUCI, moveUCI)
	}

	// moves, _ := json.Marshal(validMoves)
	fmt.Println("moves: ", movesUCI)
	fmt.Println("string move 0: ", validMoves[0].String())
	c.IndentedJSON(http.StatusOK, ValidMovesData{Moves: movesUCI})
	return
}

// PUT join a game (gameUuid, blackId) -> return FEN + outcome (if any)
//
//	-> then broadcast the FEN + the other's players valid moves + outcome (if any)
func PutJoinGame(c *gin.Context) {
	uuidString := c.Param("uuid")
	blackId, _ := strconv.Atoi(c.Param("blackId"))
	uuid, _ := uuid.Parse(uuidString)

	g, exists := games[uuid]
	if exists {
		g.BlackId = blackId
		games[uuid] = g

		positionData := g.getGamePositionData()
		c.IndentedJSON(http.StatusOK, positionData)
		return
	}

	c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game not found"})
}

// PUT make a move (game uuid, playerID, move (in algebraic notation)) -> return FEN + outcome (if any)
//
//	-> then broadcast the FEN + the other's players valid moves + outcome (if any)
func PutMove(c *gin.Context) {
	uuidString := c.Param("uuid")
	uuid, _ := uuid.Parse(uuidString)
	playerId, _ := strconv.Atoi(c.Param("playerId"))
	move := c.Param("move")

	g, exists := games[uuid]
	if !exists {
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game not found"})
		return
	}

	_, userExists := Users[playerId]
	if !userExists {
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "user not found"})
		return
	}

	isCorrectPlayer, err := g.isPlayerIdTurn(playerId)
	if !isCorrectPlayer || err != nil {
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "not your turn!"})
		return
	}

	game := g.getGameFromPGN()

	// check if game did not already reach an outcome
	if game.Outcome() != chess.NoOutcome {
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game is no longer active"})
		return
	}

	// make move using algebraic notation
	if err := game.MoveStr(move); err != nil {
		// handle error
		fmt.Println(err)
	}

	// TODO: broadcast to both listeners the new position data, and the next set of possible moves?
	// c.Status(http.StatusNoContent)

	positionData := g.getGamePositionData()
	c.IndentedJSON(http.StatusOK, positionData)
	return
}
