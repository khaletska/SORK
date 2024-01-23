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

func GetGroupEvents(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	groupID, err := strconv.Atoi(vars["id"])
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	currentUser, err := sqlite.CheckCookie(r)
	if err != nil {
		fmt.Println("CheckCookie error", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	events, err := sqlite.DB.GetEventsByGroupID(groupID, currentUser.ID)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	bytes, err := json.Marshal(events)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(bytes)
}

func CreateEvent(w http.ResponseWriter, r *http.Request) {
	newEvent := &models.CreateEvent{}

	author, err := sqlite.CheckCookie(r)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		fmt.Println("CheckCookie error: ", err)
		return
	}

	vars := mux.Vars(r)
	groupID, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Println("id value in URL path is not a number", err)
		return
	}

	if err := helpers.DecodeForm(newEvent, r); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("error decoding new event form", err)
		return
	}

	newEvent.GroupID = groupID
	newEvent.AuthorID = author.ID

	id, err := sqlite.DB.CreateEvent(newEvent)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("CreateEvent", err)
		return
	}

	bytes, err := json.Marshal(id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(bytes)
}

func ParticipationStatusChangeHandler(w http.ResponseWriter, r *http.Request) {
	newParticipationStatus := &models.EventParticipationStatus{}

	member, err := sqlite.CheckCookie(r)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		fmt.Println("CheckCookie error: ", err)
		return
	}

	if err := helpers.DecodeForm(newParticipationStatus, r); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("error decoding new event form", err)
		return
	}

	newParticipationStatus.MemberID = member.ID

	err = sqlite.DB.UpdateEventParticipationStatus(newParticipationStatus)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("Error with UpdateEventParticipationStatus request: ", err)
	}
}
