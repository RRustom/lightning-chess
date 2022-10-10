package db

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/notnil/chess"
)

type Game struct {
	Uuid      uuid.UUID `json:"uuid"`
	WhiteId   int       `json:"whiteId"` // white player ID
	BlackId   int       `json:"blackId"` // black player ID
	Positions []string  `json:"moves"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type GamePayment struct {
	GameUuid       uuid.UUID
	WhiteInvoice   Invoice
	BlackInvoice   Invoice
	DidWhitePay    bool
	DidBlackPay    bool
	WinningInvoice Invoice
}

// uuid to Game
var Games = make(map[uuid.UUID]Game)

// uuid to GamePayment
var GamePayments = make(map[uuid.UUID]GamePayment)

func (g *Game) GetLatestPosition() *chess.Game {
	lp := g.Positions[len(g.Positions)-1]

	fen, _ := chess.FEN(lp)
	return chess.NewGame(chess.UseNotation(chess.UCINotation{}), fen)
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
