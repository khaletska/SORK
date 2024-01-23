package models

import "database/sql"

type ChatName struct {
	// this is the ID of other user if chat private
	// and same group ID as in the Chat struct if group
	ID    int            `json:"id"`
	Name  string         `json:"name"`
	Image sql.NullString `json:"image"`
}

type Chat struct {
	// this is the chat ID or group ID if group chat
	ID          int       `json:"id"`
	IsGroup     bool      `json:"isGroup"`
	ChatName    ChatName  `json:"chatName"`
	ChatHistory []Message `json:"chatHistory"`
	CurrUser    User      `json:"currUser"`
}

type Message struct {
	ID         int    `json:"id"`
	ChatID     int    `json:"chatID"`
	Type       string `json:"type"`
	Sender     User   `json:"sender"`
	Content    string `json:"content"`
	SentAT     string `json:"sentAT"`
	ReceiverID int    `json:"receiverID"`
}
