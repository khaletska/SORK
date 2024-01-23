package profile

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sn/db/sqlite"
	"sn/models"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
)

func FollowRequest(w http.ResponseWriter, r *http.Request) {
	fetchUserID, currentUserID, err := GetRequestInfo(w, r)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
	}

	cookie, _ := r.Cookie("potato_batat_bulba")
	_, err = sqlite.DB.CheckSession(cookie)
	if err != nil {
		fmt.Println("middleware error", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	err = sqlite.DB.AddFollowing(currentUserID, fetchUserID)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	user, err := sqlite.DB.GetUserByID(fetchUserID)
	if err != nil {
		fmt.Println("error getting user while adding follow", err, "-/profile/follow.go")
		w.WriteHeader(http.StatusNotFound)
		return
	}
	if user.IsPublic {
		err := sqlite.DB.AcceptFriend(fetchUserID, currentUserID)
		if err != nil {
			fmt.Println("error accepting user while adding follow", err, "-/profile/follow.go")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	}
}

func CancelFollowRequestUser(w http.ResponseWriter, r *http.Request) {
	fetchUserID, currentUserID, err := GetRequestInfo(w, r)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
	}

	cookie, _ := r.Cookie("potato_batat_bulba")
	_, err = sqlite.DB.CheckSession(cookie)
	if err != nil {
		fmt.Println("middleware error", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	err = sqlite.DB.RemoveFollows(currentUserID, fetchUserID)
	if err != nil {
		fmt.Println("error removing follow request", err, "-/profile/follow.go")
		w.WriteHeader(http.StatusNotFound)
		return
	}

	// delete notification if it exists:
	err = sqlite.DB.DeleteFollowingNotification(currentUserID, fetchUserID)
	if err != nil {
		fmt.Println("error removing follow removal notification", err, "-/profile/follow.go")
		w.WriteHeader(http.StatusNotFound)
		return
	}
}

func Unfollow(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.Atoi(vars["id"])
	if err != nil {
		fmt.Println("error extracting user id", err, "-/profile/follow.go")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	cookie, _ := r.Cookie("potato_batat_bulba")
	user, err := sqlite.DB.CheckSession(cookie)
	if err != nil {
		fmt.Println("error confirming user ", err, "-/profile/follow.go")
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	command := strings.Split(r.URL.Path, "/")[1]

	if command == "remove-follower" {
		err = sqlite.DB.RemoveFollows(userID, user.ID)
		if err != nil {
			fmt.Println("error removing follow1", err, "-/profile/follow.go")
			w.WriteHeader(http.StatusNotFound)
			return
		}
	} else {
		err = sqlite.DB.RemoveFollows(user.ID, userID)
		if err != nil {
			fmt.Println("error removing follow2", err, "-/profile/follow.go")
			w.WriteHeader(http.StatusNotFound)
			return
		}
	}

	var updatedFollowing *[]models.User
	updatedFollowing, _ = sqlite.DB.GetFollowingByUserID(user.ID)
	user.Following = *updatedFollowing

	bytes, err := json.Marshal(user)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
	}

	w.Write(bytes)
}
