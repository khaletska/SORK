package models

import "database/sql"

type Group struct {
	ID          int            `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Creator     User           `json:"creator"`
	Image       sql.NullString `json:"image"`
	IsMember    int            `json:"isMember"` // -1 - no, 0 - pending, 1 - member
}
