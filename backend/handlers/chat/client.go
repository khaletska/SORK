package chat

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	ID     int
	conn   *websocket.Conn
	hub    *Hub
	egress chan Event
}

var (
	pongWait     = 10 * time.Second
	pingInterval = (pongWait * 9) / 10
)

func NewClient(ID int, conn *websocket.Conn, hub *Hub) *Client {
	return &Client{
		ID:     ID,
		conn:   conn,
		hub:    hub,
		egress: make(chan Event),
	}
}

func (c *Client) Read() {
	defer func() {
		c.hub.RemoveClient(c)
	}()

	if err := c.conn.SetReadDeadline(time.Now().Add(pongWait)); err != nil {
		log.Println(err)
		return
	}

	c.conn.SetPongHandler(c.PongHandler)
	for {
		// reads the message from the client
		_, payload, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error reading message: %v", err)
			}
			fmt.Println("websocket err: ", err)
			break
		}

		var request Event
		// decode payload into the request variable
		// paylod should contain chat or notification information
		if err := json.Unmarshal(payload, &request); err != nil {
			log.Printf("error marshalling message: %v", err)
			break
		}

		// routes the event to a certain function
		if err := c.hub.routeEvent(request, c); err != nil {
			log.Println("Error handling message: ", err)
		}
	}
}

func (c *Client) Write() {
	// creates a ticker that sends a ping to the server every 10 seconds
	ticker := time.NewTicker(pingInterval)

	defer func() {
		ticker.Stop()
		c.hub.RemoveClient(c) // TODO
	}()

	for {
		select {
		// if there is a message in the egress channel, sends it to the browser
		case message, ok := <-c.egress:
			if !ok {
				if err := c.conn.WriteMessage(websocket.CloseMessage, nil); err != nil {
					log.Println("connection closed", err)
				}
				return
			}

			data, err := json.Marshal(message)
			if err != nil {
				log.Println(err)
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, data); err != nil {
				log.Println(err)
			}

			log.Println("sent message")
		case <-ticker.C:
			// Sends a ping every 10 seconds, to keep the connection alive
			if err := c.conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				log.Println("writemsg: ", err)
				return
			}
		}
	}
}

// every ping is responded by a pong and this function sets connection deadline
func (c *Client) PongHandler(pongMessage string) error {
	return c.conn.SetReadDeadline(time.Now().Add(pongWait))
}
