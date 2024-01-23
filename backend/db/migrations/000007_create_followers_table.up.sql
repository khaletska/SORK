-- +migrate Up
CREATE TABLE followers (
    id INTEGER PRIMARY KEY,
    follower_id INTEGER REFERENCES users (id),
    user_being_followed_id INTEGER REFERENCES users (id),
    is_accepted INTEGER NOT NULL,
    is_follower_close_friend INTEGER NOT NULL
);