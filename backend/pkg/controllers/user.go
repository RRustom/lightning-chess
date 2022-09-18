package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"sync/atomic"

	"github.com/gin-gonic/gin"
)

type User struct {
	Id       int    `json:"id"`
	Username string `json:"username"`
}

var maxId uint64

type NewUserData struct {
	Username string `json:"username"`
}

var Users = make(map[int]User)

// POST create a new user
func PostNewUser(c *gin.Context) {
	var data NewUserData

	if err := c.BindJSON(&data); err != nil {
		fmt.Println(err)
		return
	}

	atomic.AddUint64(&maxId, 1)
	userId := int(atomic.LoadUint64(&maxId))

	newUser := User{
		Id:       userId,
		Username: data.Username,
	}
	Users[userId] = newUser

	c.String(http.StatusCreated, strconv.Itoa(userId))
}
