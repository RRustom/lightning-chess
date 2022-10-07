package controllers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/RRustom/lightning-chess/pkg/db"
	"github.com/gin-gonic/gin"
)

type NewUserData struct {
	Username string `json:"username"`
}

// GET game by uuid -> return FEN + outcome
func GetUserById(c *gin.Context) {
	userId := c.Param("id")
	id, _ := strconv.Atoi(userId)

	user, exists := db.Users[id]

	if exists {
		c.IndentedJSON(http.StatusOK, user)
		return
	}

	c.IndentedJSON(http.StatusNotFound, gin.H{"message": "game not found"})
}

// POST create a new user
func PostNewUser(c *gin.Context) {
	var data NewUserData

	if err := c.BindJSON(&data); err != nil {
		fmt.Println(err)
		return
	}

	userId := db.CreateNewUser(data.Username)

	c.String(http.StatusCreated, strconv.Itoa(userId))
}
