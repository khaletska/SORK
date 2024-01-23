package group

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sn/db/sqlite"
	"strconv"

	"github.com/gorilla/mux"
)

func GetGroupPosts(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	groupID, err := strconv.Atoi(vars["id"])
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	posts, err := sqlite.DB.GetPostsByGroupID(groupID)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	bytes, err := json.Marshal(posts)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(bytes)
}
