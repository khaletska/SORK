-- +migrate Up
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users (id),
    session_id INTEGER NOT NULL,
    expiration_time DATE NOT NULL
);