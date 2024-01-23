package models

import "database/sql"

type 	Notification struct {
	ID         int              `json:"id"`
	ReceiverID int              `json:"receiverID"`
	Data       NotificationData `json:"data"`
	IsRead     bool             `json:"isRead"`
	Timestamp  string           `json:"timestamp"`
}

type NotificationType string

const (
	FollowingNotification  NotificationType = "following"
	InvitationNotification NotificationType = "invitation"
	JoiningNotification    NotificationType = "joining"
	NewEventNotification   NotificationType = "newEvent"
	LikeNotification       NotificationType = "like"
	CommentNotification    NotificationType = "comment"
	ChatNotification       NotificationType = "chat"
)

type NotificationData struct {
	// Type can be 'following' / 'invitation' / 'joining' / 'newEvent' / 'like' / 'comment'
	Type NotificationType `json:"type"`
	// LeftEntity represents the sender or event (for frontend data)
	// Name should be the user's full name or event's name (matching the image)
	LeftEntity NotificationEntity `json:"leftEntity,omitempty"`
	// RightEntity represents an optional post or group
	// Name should be the post's title or group's name (matching the image)
	RightEntity NotificationEntity `json:"rightEntity,omitempty"`
	SenderID    int                `json:"senderID,omitempty"`
	GroupID     int                `json:"groupID,omitempty"`
	EventID     int                `json:"eventID,omitempty"`
	PostID      int                `json:"postID,omitempty"`
	ChatID      int                `json:"chatID,omitempty"`
}

type NotificationEntity struct {
	ID    int            `json:"id,omitempty"`
	Name  string         `json:"name,omitempty"`
	Image sql.NullString `json:"image,omitempty"`
}

/* 	Data field in DB:

{
	"type": _, 		-> 'following' / 'invitation' / 'joining' / 'newEvent' / 'like' / 'comment'
	"senderID": _, 	-> null (or -1) for 'newEvent'
	"groupID": _,	-> null (or -1) for 'following' / 'like' / 'comment'
	"eventID": _,	-> not null (or -1) only for 'newEvent'
	"postID": _,	-> null (or -1) for 'following' / 'invitation' / 'joining' / 'newEvent'
}

*/
