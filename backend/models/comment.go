package models

import "database/sql"

type Comment struct {
	ID        int            `json:"id"`
	PostID    int            `json:"postID"`
	Author    User           `json:"author"`
	Content   string         `json:"content"`
	CreatedAT string         `json:"createdAT"`
	Image     sql.NullString `json:"image"`
}
