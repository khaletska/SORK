package main

import (
	"fmt"
	"log"
	"net/http"
	"sn/db/sqlite"
	"sn/handlers/chat"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func upgrade(w http.ResponseWriter, r *http.Request) (*websocket.Conn, error) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	return conn, nil
}

func (app *application) ChatHandler(w http.ResponseWriter, r *http.Request) {
	user, err := sqlite.CheckCookie(r)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	conn, err := upgrade(w, r)
	if err != nil {
		fmt.Println(err)
	}

	client := chat.NewClient(user.ID, conn, app.Hub)

	app.Hub.AddClient(client)
	fmt.Println("hub size: ", len(app.Hub.Clients))
	go client.Read()
	go client.Write()
}
