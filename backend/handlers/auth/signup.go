package auth

import (
	"fmt"
	"net/http"
	"sn/db/sqlite"
	"sn/helpers"
	"sn/models"
)

func SignUpHandler(w http.ResponseWriter, r *http.Request) {
	newUser := &models.SignupUser{}
	if err := helpers.DecodeForm(newUser, r); err != nil {
		//render 500
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("error decoding signup form", err)
		return
	}

	notValidEmail, err := sqlite.DB.CheckEmailInUse(newUser.User.Email)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("error validating email", err)
		return
	}

	if notValidEmail {
		fmt.Println("not valid email")
		helpers.MarshalJSON(struct {
			Success bool   `json:"success"`
			Error   string `json:"error"`
		}{Success: false, Error: "Email already in use"}, w)
		return
	}

	// for authorization
	authUser := &models.AuthUser{
		Email:    newUser.User.Email,
		Password: newUser.Password,
	}

	newUser.Password, err = helpers.HashPassword(newUser.Password)
	if err != nil {
		fmt.Println("error hashing password")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = sqlite.DB.CreateUser(newUser)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("error creating user, ", err)
		helpers.MarshalJSON(struct {
			Success bool   `json:"success"`
			Error   string `json:"error"`
		}{Success: false, Error: "error creating account, try again"}, w)
		return
	}

	userID, _ := sqlite.DB.CheckPassword(authUser)
	cookie, err := sqlite.DB.CreateSession(userID)
	if err != nil {
		fmt.Println("error creating session, ", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, cookie)

	helpers.MarshalJSON(struct {
		Success bool `json:"success"`
	}{Success: true}, w)
}
