package post

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sn/db/sqlite"
	"sn/helpers"
	"sn/models"
)

func CreatePost(w http.ResponseWriter, r *http.Request) {
	user, err := sqlite.CheckCookie(r)
	if err != nil {
		fmt.Println("CheckCookie error", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	newPost := &models.Post{
		Author: *user,
	}

	err = helpers.DecodeForm(&newPost, r)
	if err != nil {
		fmt.Println("error decoding JSON", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	id, err := sqlite.DB.CreatePost(newPost)
	if err != nil {
		fmt.Println("adding post to db", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	bytes, err := json.Marshal(id)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(bytes)
}
