package controllers

// import (
// 	"github.com/gin-contrib/sessions"

// 	"github.com/gin-gonic/gin"
// 	"log"
// 	"net/http"

// 	globals "gin_session_auth/globals"
// 	helpers "gin_session_auth/helpers"
// )

// func LoginGetHandler() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		session := sessions.Default(c)
// 		user := session.Get(globals.Userkey)
// 		if user != nil {
// 			c.HTML(http.StatusBadRequest, "login.html",
// 				gin.H{
// 					"content": "Please logout first",
// 					"user":    user,
// 				})
// 			return
// 		}
// 		c.HTML(http.StatusOK, "login.html", gin.H{
// 			"content": "",
// 			"user":    user,
// 		})
// 	}
// }

// func LoginPostHandler() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		session := sessions.Default(c)
// 		user := session.Get(globals.Userkey)
// 		if user != nil {
// 			c.HTML(http.StatusBadRequest, "login.html", gin.H{"content": "Please logout first"})
// 			return
// 		}

// 		username := c.PostForm("username")
// 		password := c.PostForm("password")

// 		if helpers.EmptyUserPass(username, password) {
// 			c.HTML(http.StatusBadRequest, "login.html", gin.H{"content": "Parameters can't be empty"})
// 			return
// 		}

// 		if !helpers.CheckUserPass(username, password) {
// 			c.HTML(http.StatusUnauthorized, "login.html", gin.H{"content": "Incorrect username or password"})
// 			return
// 		}

// 		session.Set(globals.Userkey, username)
// 		if err := session.Save(); err != nil {
// 			c.HTML(http.StatusInternalServerError, "login.html", gin.H{"content": "Failed to save session"})
// 			return
// 		}

// 		c.Redirect(http.StatusMovedPermanently, "/dashboard")
// 	}
// }

// func LogoutGetHandler() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		session := sessions.Default(c)
// 		user := session.Get(globals.Userkey)
// 		log.Println("logging out user:", user)
// 		if user == nil {
// 			log.Println("Invalid session token")
// 			return
// 		}
// 		session.Delete(globals.Userkey)
// 		if err := session.Save(); err != nil {
// 			log.Println("Failed to save session:", err)
// 			return
// 		}

// 		c.Redirect(http.StatusMovedPermanently, "/")
// 	}
// }

// func IndexGetHandler() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		session := sessions.Default(c)
// 		user := session.Get(globals.Userkey)
// 		c.HTML(http.StatusOK, "index.html", gin.H{
// 			"content": "This is an index page...",
// 			"user":    user,
// 		})
// 	}
// }

// func DashboardGetHandler() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		session := sessions.Default(c)
// 		user := session.Get(globals.Userkey)
// 		c.HTML(http.StatusOK, "dashboard.html", gin.H{
// 			"content": "This is a dashboard",
// 			"user":    user,
// 		})
// 	}
// }
