package controllers

type User struct {
	Id       int    `json:"id"`
	Username string `json:"username"`
}

var Users = make(map[int]User)
