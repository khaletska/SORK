package models

type Session struct {
	ID            int    `json:"id"`
	User          string `json:"user"`
	ExirationTime string `json:"exiration_time"`
}
