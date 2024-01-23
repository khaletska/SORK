package mw

import (
	"fmt"
	"net/http"
	"sn/db/sqlite"
)

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("potato_batat_bulba")
		if err != nil {
			fmt.Println("middleware error-1", err)
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		// fmt.Println("req url: ", r.URL.Path, "\ncookie: ", cookie)
		_, err = sqlite.DB.CheckSession(cookie)
		if err != nil {
			fmt.Println("middleware error-2", err)
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}
