package post

import (
	"fmt"
	"net/http"
	"sn/db/sqlite"
	"sn/helpers"
	"sn/models"
	"strconv"

	"github.com/gorilla/mux"
)

func FetchComments(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	postID, err := strconv.Atoi(vars["id"])
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	comments, err := sqlite.DB.GetCommentsByPostID(postID)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	helpers.MarshalJSON(comments, w)
}

func AddComment(w http.ResponseWriter, r *http.Request) {
	// check the filesize, if the file is too large, the writer closes the connection - should check this in frontend aswell
	var maxUploadSize = int64(5 * 1024 * 1024) // 5Mb
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)
	// get the current user
	user, err := sqlite.CheckCookie(r)
	if err != nil {
		fmt.Println("error validating user session adding a new comment", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	comment := &models.Comment{
		Author: *user,
	}

	err = helpers.DecodeForm(comment, r)
	if err != nil {
		fmt.Println("error decoding JSON", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if !comment.Image.Valid && comment.Content == "" {
		helpers.MarshalJSON(struct{ Error string }{Error: "comment is empty"}, w)
		return
	}

	//add the comment to the db
	err = sqlite.DB.CreateComment(comment)
	if err != nil {
		fmt.Println("error adding comment: ", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// if everything is successful, send an answer
	fmt.Println("comment added succesfully")
	helpers.MarshalJSON(struct {
		Success bool `json:"success"`
	}{Success: true}, w)
}
