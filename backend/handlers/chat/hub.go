package chat

import (
	"errors"
	"fmt"
	"sn/db/sqlite"
	"sn/models"
	"sync"
)

type Clients map[*Client]bool

type ChatRoom struct {
	clients Clients
	chat    models.Chat
}

type ChatID struct {
	ID      int  `json:"id"`
	IsGroup bool `json:"isGroup"`
}

type Hub struct {
	ClientsByChat map[ChatID]ChatRoom
	Clients       Clients
	mutex         sync.Mutex
	handlers      map[string]EventHandler
}

func NewHub() *Hub {
	hub := &Hub{
		ClientsByChat: make(map[ChatID]ChatRoom),
		Clients:       make(map[*Client]bool),
		handlers:      make(map[string]EventHandler),
	}
	hub.setupEventHandler()
	return hub
}

func NewChatRoom() ChatRoom {
	return ChatRoom{
		clients: make(Clients),
	}
}

func (hub *Hub) AddClient(client *Client) {
	if _, ok := hub.Clients[client]; ok {
		hub.RemoveClient(client)
	}

	hub.mutex.Lock()
	defer hub.mutex.Unlock()

	chats, _ := sqlite.DB.GetChatsByUserID(client.ID)

	for _, chat := range chats {
		chatID := ChatID{
			ID:      chat.ID,
			IsGroup: chat.IsGroup,
		}

		if _, ok := hub.ClientsByChat[chatID]; !ok {
			hub.ClientsByChat[chatID] = NewChatRoom()
		}

		hub.ClientsByChat[chatID].clients[client] = true
	}

	hub.Clients[client] = true
}

func (hub *Hub) RemoveClient(client *Client) {
	hub.mutex.Lock()
	defer hub.mutex.Unlock()

	if _, ok := hub.Clients[client]; ok {
		chats, err := sqlite.DB.GetChatsByUserID(client.ID)
		if err != nil {
			fmt.Println("Error getting chats by user ID: ", err)
		}

		for _, chat := range chats {
			chatID := ChatID{
				ID:      chat.ID,
				IsGroup: chat.IsGroup,
			}
			delete(hub.ClientsByChat[chatID].clients, client)
		}
		delete(hub.Clients, client)

		client.conn.Close()
	}
}

func (hub *Hub) findClient(clientID int) *Client {
	for c := range hub.Clients {
		if c.ID == clientID {
			return c
		}
	}

	return nil
}

func (hub *Hub) CreateNewChatRoom(event *Event, c *Client) error {
	chatID, err := sqlite.DB.CreateChat(event.Payload.Message.Sender.ID, event.Payload.Message.ReceiverID)
	if err != nil {
		return err
	}
	if chatID == nil {
		return errors.New("error creating a new chat - chat/event.go")
	}

	newChatId := ChatID{
		ID:      *chatID,
		IsGroup: false,
	}

	if _, ok := hub.ClientsByChat[newChatId]; !ok {
		hub.ClientsByChat[newChatId] = NewChatRoom()
	}

	event.Type = EventReceiveMessage
	event.Payload.Chat.ID = *chatID
	event.Payload.Message.ChatID = *chatID
	event.Payload.Chat = newChatId

	receiver := hub.findClient(event.Payload.Message.ReceiverID)
	hub.ClientsByChat[newChatId].clients[c] = true
	if receiver != nil {
		hub.ClientsByChat[newChatId].clients[receiver] = true
	}
	return nil
}
