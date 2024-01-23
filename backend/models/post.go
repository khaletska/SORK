package models

import "database/sql"

type Post struct {
	ID                int            `json:"id"`
	Title             string         `json:"title"`
	Content           string         `json:"content"`
	Author            User           `json:"author"`
	CreatedAT         string         `json:"createdAT"`
	GroupID           sql.NullInt64  `json:"groupID"`
	Privacy           string         `json:"privacy"`
	Image             sql.NullString `json:"image"`
	Likes             int            `json:"likes"`
	IsLikedByCurrUser bool           `json:"isLikedByCurrUser"`
}
