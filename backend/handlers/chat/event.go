package chat

import (
	"errors"
	"fmt"
	"sn/db/sqlite"
	"sn/models"
)

type Payload struct {
	Message      models.Message      `json:"msg"`
	Chat         ChatID              `json:"chat"`
	Notification models.Notification `json:"notification"`
}

// create a struct to accept raw json data from the websocket connection
type Event struct {
	Type    string  `json:"type"`
	Payload Payload `json:"payload"`
}

type EventHandler func(event Event, c *Client) error

const (
	//receiving events
	EventReceiveMessage = "receive_message"
	EventReceiveNotif   = "receive_notif"

	//sending events
	EventSendMessage      = "send_message"
	EventSendNotification = "send_notif"
	EventError            = "error"
)

var ErrEventNotSupported = errors.New("this event type is not supported")

// routes events recived from the browser, every event type has a function that will deal with it
func (hub *Hub) routeEvent(event Event, c *Client) error {
	if handler, ok := hub.handlers[event.Type]; ok {
		if err := handler(event, c); err != nil {
			return err
		}
		return nil
	} else {
		return ErrEventNotSupported
	}
}

// here we assign functions to handle different events
func (hub *Hub) setupEventHandler() {
	hub.handlers[EventSendMessage] = hub.sendMessage
	hub.handlers[EventSendNotification] = hub.sendNotification
}

func (hub *Hub) sendMessage(event Event, c *Client) error {
	fmt.Println(event.Payload.Chat.ID)
	if event.Payload.Chat.ID == 0 {
		err := hub.CreateNewChatRoom(&event, c)
		if err != nil {
			return err
		}
	}

	err := sqlite.DB.AddMessage(&event.Payload.Message)
	if err != nil {
		event.Type = EventError
		c.egress <- event
		fmt.Println("send message error", err)
		return err
	}

	chat := event.Payload.Chat

	members := hub.ClientsByChat[chat]

	groupID := 0
	receiverID := 0
	if chat.IsGroup {
		groupID = chat.ID
		receiverID = chat.ID
	} else {
		for c := range members.clients {
			if c.ID != event.Payload.Message.Sender.ID {
				receiverID = c.ID
				break
			}
		}
	}

	chatNotification := models.Notification{
		ReceiverID: receiverID,
		Data: models.NotificationData{
			Type:     "chat",
			SenderID: event.Payload.Message.Sender.ID,
			GroupID:  groupID,
			ChatID:   chat.ID,
		},
		IsRead: false,
	}

	err = sqlite.DB.CreateNotification(&chatNotification)
	if err != nil {
		fmt.Println("send notification error", err)
		return err
	}

	event.Type = EventReceiveMessage
	// send message to users
	members.Broadcast(event)

	return nil
}

func (hub *Hub) sendNotification(event Event, c *Client) error {
	err := sqlite.DB.CreateNotification(&event.Payload.Notification)
	if err != nil {
		fmt.Println("send notification error", err)
		return err
	}

	event.Type = EventReceiveNotif

	go func() {
		for c := range c.hub.Clients {
			if c.ID == event.Payload.Notification.ReceiverID {
				fmt.Println("sending notification default - chat/event.go")
				c.egress <- event
			}
		}
	}()

	return nil
}

func (ChatRoom ChatRoom) Broadcast(event Event) {
	for c := range ChatRoom.clients {
		c.egress <- event

	}
}
