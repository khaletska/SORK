package models

import "database/sql"

type Event struct {
	ID          		int            	`json:"id"`
	Group       		Group          	`json:"group"`
	Author      		User           	`json:"author"`
	Title       		string         	`json:"title"`
	Description 		string         	`json:"description"`
	Image       		sql.NullString 	`json:"image"`
	HappeningAt 		string         	`json:"happeningAT"`
	Participants 		[]User 			`json:"participants"`
	IsCurrentUserGoing 	sql.NullBool 	`json:"isCurrentUserGoing"`
}

type CreateEvent struct {
	GroupID       	int          	`json:"groupID"`
	AuthorID      	int           	`json:"authorID"`
	Title       	string         	`json:"title"`
	Description 	string         	`json:"description"`
	Image       	sql.NullString	`json:"image"`
	HappeningAt 	string         	`json:"happeningAT"`
}

type EventParticipationStatus struct {
	EventID       		int				`json:"eventID"`
	MemberID      		int				`json:"authorID"`
	IsParticipating		sql.NullBool	`json:"isParticipating"`
}