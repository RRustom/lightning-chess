package db

type User struct {
	Id       int    `json:"id"`
	Username string `json:"username"`
	NodeID   string `json:"node_id"`
}

var Users = make(map[int]User)
