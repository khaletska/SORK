package auth

import (
	"fmt"
	"net/http"
	"sn/db/sqlite"
	"sn/helpers"
	"sn/models"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	authUser := &models.AuthUser{}
	if err := helpers.DecodeForm(authUser, r); err != nil {
		//render 500
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("error decoding signup form", err)
		return
	}

	if authUser.Email == "" || authUser.Password == "" {
		fmt.Println("invalid credentials")
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	userID, err := sqlite.DB.CheckPassword(authUser)
	if userID == 0 || err != nil {
		fmt.Println("error authenticating /no user found, ", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	// USER VALIDATED, creating session, sending data
	cookie, err := sqlite.DB.CreateSession(userID)
	fmt.Println(cookie.Value)
	if err != nil {
		fmt.Println("error creating session, ", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, cookie)
	user, err := sqlite.DB.GetUserByID(userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	helpers.MarshalJSON(user, w)
}
