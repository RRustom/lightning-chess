package controllers

type Game struct {
	uuid      string `json:"id"`
	pgn       string `json:"title"`
	whiteId   int64  `json:"artist"`
	blackId   int64  `json:"price"`
	createdAt float64
	updatedAt float64
}
