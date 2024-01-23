package group

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sn/db/sqlite"
	"sn/helpers"
	"sn/models"
)

func CreateGroup(w http.ResponseWriter, r *http.Request) {
	user, err := sqlite.CheckCookie(r)
	if err != nil {
		fmt.Println("CheckCookie error", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	newGroup := &models.Group{
		Creator: *user,
	}

	err = helpers.DecodeForm(&newGroup, r)
	if err != nil {
		fmt.Println("CreateGroup error decoding JSON", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	fmt.Println(newGroup)

	id, err := sqlite.DB.CreateGroup(newGroup)
	if err != nil {
		fmt.Println("adding group to db", err)
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
