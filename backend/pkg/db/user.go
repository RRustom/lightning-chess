package db

import (
	"errors"
	"math/rand"
	"sync/atomic"
)

type User struct {
	Id       int    `json:"id"`
	Username string `json:"userName"`
	Picture  int    `json:"picture"`
	NodeId   string `json:"node_id"`
}

var maxId uint64

var Users = make(map[int]User)
var UserNodes = make(map[int]string) // map user Id to nodeID

func GetUserByNodeID(nodeId string) (int, error) {
	for userId, nId := range UserNodes {
		if nId == nodeId {
			return userId, nil
		}
	}

	return 0, errors.New("user does not exist")
}

func CreateNewUser(userName string) int {
	atomic.AddUint64(&maxId, 1)
	userId := int(atomic.LoadUint64(&maxId))

	picture := rand.Intn(10000000)

	newUser := User{
		Id:       userId,
		Username: userName,
		Picture:  picture,
	}

	Users[userId] = newUser

	return userId
}
