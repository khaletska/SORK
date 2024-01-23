package home

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sn/db/sqlite"
	"sn/helpers"
)

func FetchHomeGroups(w http.ResponseWriter, r *http.Request) {
	_, err := sqlite.CheckCookie(r)
	if err != nil {
		fmt.Println("CheckCookie error", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	allGroups, err := sqlite.DB.ReadGroups()

	bytes, err := json.Marshal(allGroups)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(bytes)
}

func FetchHomePosts(w http.ResponseWriter, r *http.Request) {
	user, err := sqlite.CheckCookie(r)
	if err != nil {
		fmt.Println("CheckCookie error", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	usersPosts, err := sqlite.DB.ReadPosts(user.ID)

	bytes, err := json.Marshal(usersPosts)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(bytes)
}

func CheckUser(w http.ResponseWriter, r *http.Request) {
	user, err := sqlite.CheckCookie(r)

	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	helpers.MarshalJSON(*user, w)
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	user, err := sqlite.CheckCookie(r)
	if err != nil {
		fmt.Println("CheckCookie error in logoutHandler", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	err = sqlite.DB.DeleteSession(user.ID)
	if err != nil {
		fmt.Println("Error with deleting session", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	expiredCookie := &http.Cookie{
		Name:   "potato_batat_bulba",
		Value:  "",
		MaxAge: 0,
		Path:   "/",
	}

	http.SetCookie(w, expiredCookie)
	helpers.MarshalJSON(*user, w)
}
