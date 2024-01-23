package models

import "database/sql"

var ( // move somewhere else?
	PendingFriend = "pending"
	Friends       = "friends"
	CloseFriends  = "close_friends"
	NotFriends    = "not_friend" //??
	CurrentUser   = "currUser"
)

type User struct {
	ID          int            `json:"id"`
	FirstName   string         `json:"firstName"`
	LastName    string         `json:"lastName"`
	DateOfBirth string         `json:"dateOfBirth"`
	Email       string         `json:"email"`
	Avatar      sql.NullString `json:"avatar"`
	Nickname    sql.NullString `json:"nickname"`
	About       sql.NullString `json:"about"`
	IsPublic    bool           `json:"isPublic"`
	Followers   []User         `json:"followers"`
	Following   []User         `json:"following"`
	Friends     []User         `json:"friends"`
}

type SignupUser struct {
	User     User
	Password string
}

type AuthUser struct {
	Email    string
	Password string
}
