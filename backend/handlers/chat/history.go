package chat

import (
	"fmt"
	"net/http"
	"sn/db/sqlite"
	"sn/helpers"
	"sn/models"
	"strconv"

	"github.com/gorilla/mux"
)

func GetChatsList(w http.ResponseWriter, r *http.Request) {
	user, err := sqlite.CheckCookie(r)
	if err != nil {
		fmt.Println("Getting chats error - chat/history.go", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	chats, err := sqlite.DB.GetChatsByUserID(user.ID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	helpers.MarshalJSON[[]models.Chat](chats, w)
}

func GetChatHistory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	chatID, err := strconv.Atoi(vars["id"])
	if err != nil {
		fmt.Println("GetChatHistory - chat/history.go", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	user, err := sqlite.CheckCookie(r)
	if err != nil {
		fmt.Println("CheckCookie error - chat/history.go", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	chat := &models.Chat{}

	err = helpers.DecodeForm(chat, r)
	if err != nil {
		fmt.Println("error decoding JSON - chat/history.go", err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	chat.ID = chatID
	chat.CurrUser = *user

	sqlite.DB.GetChatHistory(chat)
	helpers.MarshalJSON(*chat, w)
}

func CheckExistingChat(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	requestedChatUserID, err := strconv.Atoi(vars["id"])
	if err != nil {
		fmt.Println("Error receiving requested chat id - /chat/history.go", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	user, err := sqlite.CheckCookie(r)
	if err != nil {
		fmt.Println("Error validating session - /chat/history.go", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	chatID, err := sqlite.DB.CheckExistingChat(user.ID, requestedChatUserID)
	if err != nil {
		fmt.Println("Error checking existing chat - /chat/history.go", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	reqUser, err := sqlite.DB.GetUserByID(requestedChatUserID)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	chat := &models.Chat{
		ChatName: models.ChatName{
			ID:    reqUser.ID,
			Name:  reqUser.FirstName + " " + reqUser.LastName,
			Image: reqUser.Avatar,
		},
		CurrUser: *user,
	}

	if chatID == nil {
		helpers.MarshalJSON(*chat, w)
		return
	}

	chat.ID = *chatID
	helpers.MarshalJSON(*chat, w)
}
