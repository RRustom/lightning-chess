package db

import (
	"errors"
	"fmt"
	"time"

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

func (g *Game) GetLatestPosition() *chess.Game {
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

func (g *Game) IsPlayerIdTurn(playerId int) (bool, error) {
	turns := len(g.Positions) - 1 // account for initial empty board

	if playerId == g.WhiteId {
		return turns%2 == 0, nil
	} else if playerId == g.BlackId {
		return turns%2 == 1, nil
	}

	return false, errors.New("player is not part of the game")
}
