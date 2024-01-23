package home

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"sn/db/sqlite"
	"sn/helpers"
	"strconv"

	"github.com/gorilla/mux"
)

func RenderNotifications(w http.ResponseWriter, r *http.Request) {
	cookie, _ := r.Cookie("potato_batat_bulba")
	user, err := sqlite.DB.CheckSession(cookie)
	if err != nil {
		fmt.Println("middleware error", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	usersNotifications, err := sqlite.DB.GetNotificationsByUserID(user.ID)
	if err != nil {
		if err != sql.ErrNoRows {
			fmt.Println("errror getting users notifications, - home/notifications.go", err)
			w.WriteHeader(http.StatusNotFound)
			return
		}
	}

	helpers.MarshalJSON(*usersNotifications, w)
}

func RenderChatNotifications(w http.ResponseWriter, r *http.Request) {
	cookie, _ := r.Cookie("potato_batat_bulba")
	user, err := sqlite.DB.CheckSession(cookie)
	if err != nil {
		fmt.Println("middleware error", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	usersNotifications, err := sqlite.DB.GetChatNotificationsByUserID(user.ID)
	if err != nil {
		if err != sql.ErrNoRows {
			fmt.Println("errror getting users chat notifications, - home/notifications.go", err)
			w.WriteHeader(http.StatusNotFound)
			return
		}
	}

	bytes, err := json.Marshal(&usersNotifications)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
	}
	w.Write(bytes)
}

func ConfirmNotification(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	notificationID, err := strconv.Atoi(vars["id"])
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	notification, err := sqlite.DB.GetNotificationByID(notificationID)
	if err != nil {
		if err != sql.ErrNoRows {
			fmt.Println("errror confirming notifications, - home/notifications.go", err)
			w.WriteHeader(http.StatusNotFound)
			return
		}
	}

	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	switch notification.Data.Type {
	case "following":
		err = sqlite.DB.AcceptFriend(notification.ReceiverID, notification.Data.SenderID)
	case "invitation":
		err = sqlite.DB.ApproveGroupMember(notification.ReceiverID, notification.Data.GroupID)
	case "joining":
		err = sqlite.DB.ApproveGroupMember(notification.Data.SenderID, notification.Data.GroupID)
	}

	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	err = sqlite.DB.DeleteNotification(notification.ID)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}
}

func DeleteNotification(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	notificationID, err := strconv.Atoi(vars["id"])
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	notification, err := sqlite.DB.GetNotificationByID(notificationID)

	switch notification.Data.Type {
	case "following":
		err = sqlite.DB.RemoveFollows(notification.Data.SenderID, notification.ReceiverID)
	case "invitation":
		err = sqlite.DB.DeleteGroupMember(notification.ReceiverID, notification.Data.GroupID)
	case "joining":
		err = sqlite.DB.DeleteGroupMember(notification.Data.SenderID, notification.Data.GroupID)
	}

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	err = sqlite.DB.DeleteNotification(notification.ID)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}
}

func NotificationsSeen(w http.ResponseWriter, r *http.Request) {
	cookie, _ := r.Cookie("potato_batat_bulba")
	user, err := sqlite.DB.CheckSession(cookie)
	if err != nil {
		fmt.Println("middleware error", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	usersNotifications, err := sqlite.DB.GetNotificationsByUserID(user.ID)

	fmt.Println("db get notifications error: ", err)

	for _, n := range *usersNotifications {
		if !n.IsRead && (n.Data.Type == "newEvent" || n.Data.Type == "like" || n.Data.Type == "comment" || n.Data.Type == "following_public") {
			err = sqlite.DB.UpdateNotification(&n)
			if err != nil {
				fmt.Println("UpdateNotification error", err)
				w.WriteHeader(http.StatusNotImplemented)
				return
			}
		}
	}
}

func ChatNotificationsSeen(w http.ResponseWriter, r *http.Request) {
	cookie, _ := r.Cookie("potato_batat_bulba")
	user, err := sqlite.DB.CheckSession(cookie)
	if err != nil {
		fmt.Println("middleware error", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	err = sqlite.DB.SetUsersChatNotificationsSeen(user.ID)
	if err != nil {
		fmt.Println("error setting notifications seen, - home/notifications.go", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}
