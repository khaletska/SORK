-- +migrate Up
CREATE TABLE likes (
    id INTEGER PRIMARY KEY,
    post_id INTEGER REFERENCES posts (id),
    liked_user_id INTEGER REFERENCES users (id)
);