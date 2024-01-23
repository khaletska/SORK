package post

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sn/db/sqlite"
	"strconv"

	"github.com/gorilla/mux"
)

func FetchPost(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	postID, err := strconv.Atoi(vars["id"])
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	post, err := sqlite.DB.GetPostByID(postID)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	cookie, _ := r.Cookie("potato_batat_bulba")
	user, err := sqlite.DB.CheckSession(cookie)
	if err != nil {
		fmt.Println("middleware error", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	isLiked, err := sqlite.DB.IsPostLikedByUser(user.ID, postID)
	if err != nil {
		fmt.Println("IsPostLikedByUser", err)
	}
	post.IsLikedByCurrUser = isLiked

	bytes, err := json.Marshal(post)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
	}
	w.Write(bytes)
}

func AddDeleteLike(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	postID, err := strconv.Atoi(vars["id"])
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	cookie, _ := r.Cookie("potato_batat_bulba")
	user, err := sqlite.DB.CheckSession(cookie)
	if err != nil {
		fmt.Println("middleware error", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	err = sqlite.DB.AddLike(user.ID, postID)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
	}
}
