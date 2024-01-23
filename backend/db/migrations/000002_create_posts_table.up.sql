-- +migrate Up
CREATE TABLE posts (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES users (id),
    creation_time DATE NOT NULL,
    group_id INTEGER,
    privacy_level TEXT,
    image TEXT
);