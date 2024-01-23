package profile

import (
	"fmt"
	"net/http"
	"sn/db/sqlite"
	"sn/helpers"
	"sn/models"
	"strconv"

	"github.com/gorilla/mux"
)

// extracts request data, if error occurs, writes header, returns to main function where it just needs to
// return so no other action is taken
func GetRequestInfo(w http.ResponseWriter, r *http.Request) (int, int, error) {
	currentUser, err := sqlite.CheckCookie(r)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return 0, 0, err
	}

	vars := mux.Vars(r)
	fetchUserID, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return 0, 0, err
	}

	return fetchUserID, currentUser.ID, nil
}

func FetchProfilePage(w http.ResponseWriter, r *http.Request) {
	fetchUserID, currentUserID, err := GetRequestInfo(w, r)
	if err != nil {
		return
	}

	res, err := sqlite.DB.CheckFriendStatus(fetchUserID, currentUserID) // get user relations
	if err != nil {
		fmt.Println("CheckFriendStatus error", err)
		return
	}

	fetchUser, err := sqlite.DB.GetUserByID(fetchUserID) // get the user thats requested
	if err != nil {
		fmt.Println("ERR: fetch profile page", err)
		w.WriteHeader(http.StatusNotFound)
		return
	}
	groups := &[]models.Group{}

	if currentUserID == fetchUserID || res == models.Friends || res == models.CloseFriends || fetchUser.IsPublic { // fetch groups if the user is currentuser or friend
		groups, err = sqlite.DB.GetGroupsByUserID(fetchUserID)
		if err != nil {
			fmt.Println("ERR: fetch profile groups", err)
			w.WriteHeader(http.StatusNotFound)
			return
		}
	}

	posts := &[]models.Post{}
	if currentUserID == fetchUserID {
		res = models.CurrentUser
		posts, err = sqlite.DB.GetPostsByUserID(fetchUserID) // fetch all posts with currentuserid
		if err != nil {
			fmt.Println("ERR: fetching profile posts", err)
			w.WriteHeader(http.StatusNotFound)
			return
		}
	} else {
		var err error
		posts, err = sqlite.DB.GetPostsByUserIDandRelation(fetchUserID, res) // fetch posts with relation
		if err != nil {
			fmt.Println("ERR: fetching profile posts", err)
			w.WriteHeader(http.StatusNotFound)
			return
		}
	}

	helpers.MarshalJSON(struct {
		User       models.User     `json:"fetchUser"`
		Groups     *[]models.Group `json:"groups"`
		Posts      *[]models.Post  `json:"posts"`
		Connection string          `json:"connection"`
	}{
		User:       *fetchUser,
		Groups:     groups,
		Posts:      posts,
		Connection: res,
	}, w)

}

func CheckPending(w http.ResponseWriter, r *http.Request) {
	fetchUserID, currentUserID, err := GetRequestInfo(w, r)
	if err != nil {
		return
	}

	res, err := sqlite.DB.CheckFriendStatus(fetchUserID, currentUserID)
	if err != nil {
		fmt.Println("CheckFriendStatus error", err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	helpers.MarshalJSON(res, w)
}

func EditProfile(w http.ResponseWriter, r *http.Request) {
	user, err := sqlite.CheckCookie(r)
	if err != nil {
		fmt.Println("CheckCookie error - profile.og", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	err = helpers.DecodeForm(&user, r)
	if err != nil {
		fmt.Println("error decoding JSON in EditProfile - profile.go", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = sqlite.DB.UpdateUser(user)
	if err != nil {
		fmt.Println("EditProfile sqlite.DB.UpdateUser(user)", err)
		w.WriteHeader(http.StatusInternalServerError)
	}

	helpers.MarshalJSON(user, w)
}
