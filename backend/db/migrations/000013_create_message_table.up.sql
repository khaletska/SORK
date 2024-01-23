-- +migrate Up
CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    chat_id INTEGER NOT NULL,
    chat_type TEXT NOT NULL,
    sender_id INTEGER REFERENCES users (id),
    message_content TEXT NOT NULL,
    timestamp DATE NOT NULL
);