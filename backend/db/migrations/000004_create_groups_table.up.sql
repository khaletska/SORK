-- +migrate Up
CREATE TABLE groups (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    creator_id INTEGER REFERENCES users (id),
    image TEXT
);