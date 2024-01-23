package main

import (
	"fmt"
	"log"
	"net/http"
	"sn/db/sqlite"
	"sn/handlers/auth"
	"sn/handlers/chat"
	"sn/handlers/group"
	"sn/handlers/home"
	"sn/handlers/post"
	"sn/handlers/profile"
	mw "sn/middleware"

	"github.com/rs/cors"

	"github.com/gorilla/mux"
)

type application struct {
	Hub *chat.Hub
}

func main() {
	sqlite.ConnectDatabase()
	app := application{
		Hub: chat.NewHub(),
	}
	r := mux.NewRouter()
	//unauthorized user
	r.HandleFunc("/login", auth.LoginHandler).Methods("POST")
	r.HandleFunc("/signup", auth.SignUpHandler).Methods("POST")          // keep
	r.HandleFunc("/update-profile", profile.EditProfile).Methods("POST") // keep
	r.HandleFunc("/check-user", home.CheckUser).Methods("GET")

	//authorized user
	authRouter := r.PathPrefix("/").Subrouter()
	authRouter.HandleFunc("/logout", home.LogoutHandler).Methods("POST")
	authRouter.HandleFunc("/groups", home.FetchHomeGroups).Methods("GET") // keep
	authRouter.HandleFunc("/posts", home.FetchHomePosts).Methods("GET")   // keep
	authRouter.HandleFunc("/notifications", home.RenderNotifications).Methods("GET")
	authRouter.HandleFunc("/notification/{id}", home.ConfirmNotification).Methods("POST")
	authRouter.HandleFunc("/notification/{id}", home.DeleteNotification).Methods("DELETE")
	authRouter.HandleFunc("/notifications/seen", home.NotificationsSeen).Methods("POST")
	authRouter.HandleFunc("/chat-notifications", home.RenderChatNotifications).Methods("GET")
	authRouter.HandleFunc("/chat-notifications/seen", home.ChatNotificationsSeen).Methods("POST")
	authRouter.HandleFunc("/profile/{id}", profile.FetchProfilePage).Methods("GET")                       // keep
	authRouter.HandleFunc("/profile/{id}/pending", profile.CheckPending).Methods("GET")                   // keep
	authRouter.HandleFunc("/following", profile.FetchFollowing).Methods("GET")                            // keep
	authRouter.HandleFunc("/followers", profile.FetchFollowers).Methods("GET")                            // keep
	authRouter.HandleFunc("/close-friends", profile.FetchCloseFriends).Methods("GET")                     // keep
	authRouter.HandleFunc("/close-friends/{friend}", profile.ModifyCloseFriend).Methods("POST", "DELETE") // keep
	authRouter.HandleFunc("/profile/{id}/request", profile.FollowRequest).Methods("POST")
	authRouter.HandleFunc("/profile/{id}/request", profile.CancelFollowRequestUser).Methods("DELETE")
	authRouter.HandleFunc("/unfollow/{id}", profile.Unfollow).Methods("DELETE")        // keep
	authRouter.HandleFunc("/remove-follower/{id}", profile.Unfollow).Methods("DELETE") // keep
	authRouter.HandleFunc("/post/{id}", post.FetchPost).Methods("GET")                 // keep
	authRouter.HandleFunc("/post/{id}/like", post.AddDeleteLike).Methods("POST")
	authRouter.HandleFunc("/post/{id}/comments", post.FetchComments).Methods("GET")   // keep
	authRouter.HandleFunc("/post/{id}/comments/new", post.AddComment).Methods("POST") // keep
	// maybe add opportunity to delete post
	authRouter.HandleFunc("/create-post", post.CreatePost).Methods("POST")
	authRouter.HandleFunc("/group/{id}", group.RenderGroupPage).Methods("GET")                    // keep
	authRouter.HandleFunc("/group/{id}/users-to-invite", group.FetchUsersToInvite).Methods("GET") // keep
	authRouter.HandleFunc("/group/{id}/create-event", group.CreateEvent).Methods("POST")
	authRouter.HandleFunc("/group/{id}/request", group.FollowRequest).Methods("POST")
	authRouter.HandleFunc("/group/{id}/request", group.Unfollow).Methods("DELETE")
	authRouter.HandleFunc("/group/{id}/invite", group.Invite).Methods("POST")
	authRouter.HandleFunc("/create-group", group.CreateGroup).Methods("POST")
	authRouter.HandleFunc("/group/{id}/events", group.GetGroupEvents).Methods("GET")       //keep
	authRouter.HandleFunc("/group/{id}/posts", group.GetGroupPosts).Methods("GET")         //keep
	authRouter.HandleFunc("/group/{id}/followers", group.GetGroupFollowers).Methods("GET") //keep
	authRouter.HandleFunc("/event/participation", group.ParticipationStatusChangeHandler).Methods("POST")
	// ws
	authRouter.HandleFunc("/chats", app.ChatHandler)
	authRouter.HandleFunc("/current-user-chats", chat.GetChatsList) // keep
	authRouter.HandleFunc("/chats/checkprivatechat/{id}", chat.CheckExistingChat)
	authRouter.HandleFunc("/chats/{id}", chat.GetChatHistory) // keep
	authRouter.Use(mw.Auth)
	r.Handle("/", authRouter)
	http.Handle("/", r)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "DELETE"},
	})

	handler := c.Handler(r)

	fmt.Println("Server started on http://localhost:8080/")
	fmt.Println("Press Ctrl+C to stop the server")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
