package helpers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gofrs/uuid"
	"golang.org/x/crypto/bcrypt"
)

// use any struct to send marshalled data to frontend, need to
// give a resonsewriter from the function you call it from
func MarshalJSON[T any](s T, w http.ResponseWriter) {
	res, err := json.Marshal(s)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

// decodes json from the body element, to use it provide the address of the
// struct you want to fill and it will use its address to fill up the data
// returns an error
// NOTE: make sure to use right JSON values in front-end
func DecodeForm[T any](s T, r *http.Request) error {
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&s)
	if err != nil {
		return err
	}
	return nil
}

func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	return string(hashedPassword), nil
}

func CheckPassword(hashedPassword string, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

func CreateCookie() (*http.Cookie, error) {
	u2, err := uuid.NewV4()
	if err != nil {
		return nil, err
	}
	cookie := &http.Cookie{
		Name:    "potato_batat_bulba",
		Value:   u2.String(),
		Expires: time.Now().Add(time.Hour * 168),
		Path:    "/",
	}
	return cookie, nil
}
