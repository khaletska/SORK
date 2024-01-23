-- +migrate Up
CREATE TABLE private_chats (
    id INTEGER PRIMARY KEY,
    user1_id INTEGER REFERENCES users (id),
    user2_id INTEGER REFERENCES users (id)
);