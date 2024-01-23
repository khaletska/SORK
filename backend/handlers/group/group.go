package group

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sn/db/sqlite"
	"strconv"

	"github.com/gorilla/mux"
)

func RenderGroupPage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	groupID, err := strconv.Atoi(vars["id"])
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	group, err := sqlite.DB.GetGroupByID(groupID)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	// add field is user a member
	user, err := sqlite.CheckCookie(r)
	if err != nil {
		fmt.Println("CheckCookie error", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if user.ID == group.Creator.ID {
		group.IsMember = 1
	} else {
		res, _ := sqlite.DB.IsUserGroupMember(user.ID, groupID)
		group.IsMember = res
	}

	bytes, err := json.Marshal(group)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(bytes)
}
