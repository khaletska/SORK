package group

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sn/db/sqlite"
	"sn/helpers"
	"sn/models"
	"strconv"

	"github.com/gorilla/mux"
)

func GetGroupFollowers(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	groupID, err := strconv.Atoi(vars["id"])
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	followers, err := sqlite.DB.GetFollowersByGroupID(groupID)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	bytes, err := json.Marshal(followers)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(bytes)
}

func FetchUsersToInvite(w http.ResponseWriter, r *http.Request) {
	currentUser, err := sqlite.CheckCookie(r)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		fmt.Println("CheckCookie error: ", err)
		return
	}

	vars := mux.Vars(r)
	groupID, err := strconv.Atoi(vars["id"])
	if err != nil {
		fmt.Println("Error converting group ID from URL path to integer: ", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	userFollowersToInvite, err := sqlite.DB.GetFollowersNotYetMembersByUserID(currentUser.ID, groupID)
	if err != nil {
		fmt.Println("Error getting list of users that current user can invite to group: ", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	bytes, err := json.Marshal(userFollowersToInvite)
	if err != nil {
		fmt.Println("Error converting users that can be invited to group into json: ", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Write(bytes)
}

func FollowRequest(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	groupID, err := strconv.Atoi(vars["id"])
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	user, err := sqlite.CheckCookie(r)
	if err != nil {
		fmt.Println("CheckCookie error", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	err = sqlite.DB.AddGroupMember(user.ID, groupID)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func Unfollow(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	groupID, err := strconv.Atoi(vars["id"])
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	user, err := sqlite.CheckCookie(r)
	if err != nil {
		fmt.Println("CheckCookie error", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	err = sqlite.DB.DeleteGroupMember(user.ID, groupID)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func Invite(w http.ResponseWriter, r *http.Request) {
	invitedUser := &models.User{}

	vars := mux.Vars(r)
	groupID, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Println("id value in URL path is not a number", err)
		return
	}

	if err := helpers.DecodeForm(invitedUser, r); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("error decoding user invited to group form", err)
		return
	}

	err = sqlite.DB.AddGroupMember(invitedUser.ID, groupID)
	if err != nil {
		fmt.Println("error AddGroupMember", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func AcceptInvitation(w http.ResponseWriter, r *http.Request) {

}
