package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	// "strconv"

	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/notnil/chess"
)

type Game struct {
	Uuid uuid.UUID `json:"uuid"`
	// Pgn       string    `json:"pgn"`     // PGN format for the whole game, with metadata
	WhiteId   int       `json:"whiteId"` // white player ID
	BlackId   int       `json:"blackId"` // black player ID
	Positions []string  `json:"moves"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

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

func (g *Game) getGameLatestPosition() *chess.Game {
	// pgnReader := strings.NewReader(g.Pgn)
	// fmt.Println("READING g.PGN: ", g.Pgn)
	// pgn, err := chess.PGN(pgnReader)

	// fmt.Println("FINISHED READING PGN FROM GAME: ", )
	// if err != nil {
	// 	fmt.Println(err)
	// }

	lp := g.Positions[len(g.Positions)-1]
	fmt.Println("Latest position: ", lp)

	fen, _ := chess.FEN(lp)
	return chess.NewGame(chess.UseNotation(chess.UCINotation{}), fen) //  chess.UseNotation(chess.AlgebraicNotation{}) chess.UseNotation(chess.UCINotation{})
}

func getGamePositionData(g Game, game *chess.Game) GamePositionData {
	// game := g.getGameLatestPosition()
	fen := game.Position().String()
	turns := len(g.Positions) - 1
	return GamePositionData{Fen: fen, Outcome: game.Outcome().String(), NumTurn: turns}
}

func (g *Game) isPlayerIdTurn(playerId int) (bool, error) {
	turns := len(g.Positions) - 1 // account for initial empty board
	fmt.Println("number turns played: ", turns)

	// fmt.Printf("%+v\n", *g)
	// fmt.Println("turns: ", turns)
	// fmt.Println("moves: ", moves)
	// fmt.Println("BlackId: ", g.BlackId)

	if playerId == g.WhiteId {
		return turns%2 == 0, nil
	} else if playerId == g.BlackId {
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

	g := chess.NewGame()

	positions := []string{g.Position().String()}

	newGame := Game{
		Uuid:      uuid.New(),
		WhiteId:   data.WhiteId,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		// Pgn:       fmt.Sprint(g),
		Positions: positions,
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
		c.IndentedJSON(http.StatusOK, g)
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

	game := g.getGameLatestPosition()
	fmt.Println("GAME: ", game)
	validMoves := game.ValidMoves()
	fmt.Println("validMoves: ", validMoves)

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

	g, exists := games[uuid]
	if exists {
		g.BlackId = data.BlackId
		games[uuid] = g

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

	fmt.Printf("player %d wants to move %s \n", data.PlayerId, data.Move)

	g, exists := games[uuid]
	if !exists {
		// c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game not found"})
		return []byte{}, errors.New("game not found")
	}

	fmt.Printf("Found game: %+v\n", g)

	_, userExists := Users[data.PlayerId]
	if !userExists {
		// c.IndentedJSON(http.StatusNotFound, gin.H{"message": "user not found"})
		return []byte{}, errors.New("user not found")
	}

	isCorrectPlayer, err := g.isPlayerIdTurn(data.PlayerId)
	if !isCorrectPlayer || err != nil {
		// c.IndentedJSON(http.StatusNotFound, gin.H{"message": "not your turn!"})
		return []byte{}, errors.New("not your turn!")
	}

	game := g.getGameLatestPosition()

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
	games[uuid] = g

	fmt.Println("game after move: ", game)
	// fmt.Println("PGN of game after move: ", fmt.Sprint(game))

	// TODO: broadcast to both listeners the new position data, and the next set of possible moves?
	// c.Status(http.StatusNoContent)

	positionData := getGamePositionData(g, game)
	fmt.Printf("Position data: %+v\n", positionData)

	u, err := json.Marshal(positionData)
	if err != nil {
		panic(err)
	}

	// var outputData bytes.Buffer        // Stand-in for a network connection
	// enc := gob.NewEncoder(&outputData) // Will write to network.
	// // dec := gob.NewDecoder(&network) // Will read from network.
	// // Encode (send) the value.
	// err = enc.Encode(positionData)
	// if err != nil {
	// 	log.Fatal("encode error:", err)
	// }

	// c.IndentedJSON(http.StatusOK, positionData)
	return u, nil
}
