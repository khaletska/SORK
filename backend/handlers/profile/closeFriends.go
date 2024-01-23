package profile

import (
	"fmt"
	"net/http"
	"sn/db/sqlite"
	"sn/helpers"
	"strconv"

	"github.com/gorilla/mux"
)

func FetchFollowing(w http.ResponseWriter, r *http.Request) {
	cookie, _ := r.Cookie("potato_batat_bulba")
	user, err := sqlite.DB.CheckSession(cookie)
	if err != nil {
		fmt.Println("error fetching following - closeFriends.go", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	users, err := sqlite.DB.GetFollowingByUserID(user.ID)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	helpers.MarshalJSON(&users, w)
}

func FetchFollowers(w http.ResponseWriter, r *http.Request) {
	cookie, _ := r.Cookie("potato_batat_bulba")
	user, err := sqlite.DB.CheckSession(cookie)
	if err != nil {
		fmt.Println("error fetching followers - closeFriends.go", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	users, err := sqlite.DB.GetFollowersByUserID(user.ID)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusNotFound)
	}

	helpers.MarshalJSON(&users, w)
}

func FetchCloseFriends(w http.ResponseWriter, r *http.Request) {
	cookie, _ := r.Cookie("potato_batat_bulba")
	user, err := sqlite.DB.CheckSession(cookie)
	if err != nil {
		fmt.Println("error fetching close friends - closeFriends.go", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	users, err := sqlite.DB.GetCloseFriendsByUserID(user.ID)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusNotFound)
	}

	helpers.MarshalJSON(&users, w)
}

func ModifyCloseFriend(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.Atoi(vars["friend"])
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
	}

	cookie, _ := r.Cookie("potato_batat_bulba")
	user, err := sqlite.DB.CheckSession(cookie)
	if err != nil {
		fmt.Println("error modifying close friends - closeFriends.go", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if r.Method == "POST" {
		err = sqlite.DB.UpdateFriend(user.ID, userID, 1)
	} else {
		err = sqlite.DB.UpdateFriend(user.ID, userID, 0)
	}

	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusNotFound)
	}

	w.WriteHeader(http.StatusOK)
}
