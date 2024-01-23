package sqlite

import (
	"errors"
	"net/http"
	"sn/helpers"
	"sn/models"
	"time"
)

func CheckCookie(r *http.Request) (*models.User, error) {
	cookie, err := r.Cookie("potato_batat_bulba")
	if cookie != nil {
		user, err := DB.CheckSession(cookie)
		if err != nil {
			return nil, err
		}
		return user, nil
	}
	return nil, err
}

func SetExpiredCookie(w http.ResponseWriter) {
	expiredCookie := &http.Cookie{
		Name:   "potato_batat_bulba",
		Value:  "",
		MaxAge: 0,
		Path:   "/",
	}

	http.SetCookie(w, expiredCookie)
}

func (d *Database) CreateSession(userID int) (*http.Cookie, error) {
	cookie, err := helpers.CreateCookie()
	if err != nil {
		return nil, err
	}
	query := `INSERT INTO sessions (
		user_id, 
		session_id, 
		expiration_time) VALUES(?,?,?)`

	_, err = d.db.Exec(query,
		userID,
		&cookie.Value,
		&cookie.Expires,
	)

	if err != nil {
		return &http.Cookie{}, errors.New("failed to bake a cookie")
	}
	return cookie, nil
}

func (d *Database) CheckSession(cookie *http.Cookie) (*models.User, error) {
	var userId, cookieId int
	dbCookie := &http.Cookie{}
	query := `SELECT * FROM sessions WHERE session_id = ?`
	row := d.db.QueryRow(query, &cookie.Value)
	err := row.Scan(
		&cookieId,
		&userId,
		&dbCookie.Value,
		&dbCookie.Expires,
	)
	if err != nil {
		return nil, err
	}
	if dbCookie.Value != cookie.Value || time.Now().After(dbCookie.Expires) {
		d.DeleteSession(userId)
		return nil, errors.New("expired session")
	}
	user, err := d.GetUserByID(userId)
	if err != nil {
		return nil, errors.New("no user found")
	}
	return user, nil
}

func (d *Database) DeleteSession(userId int) error {
	query := `DELETE FROM sessions WHERE user_id = ?`
	_, err := d.db.Exec(query, userId)
	if err != nil {
		return errors.New("failed to delete cookie")
	}
	return nil
}
