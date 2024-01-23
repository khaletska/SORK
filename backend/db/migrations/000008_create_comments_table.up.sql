-- +migrate Up
CREATE TABLE comments (
    id INTEGER PRIMARY KEY,
    post_id INTEGER REFERENCES posts (id),
    author_id INTEGER REFERENCES users (id),
    content INTEGER NOT NULL,
    created_at DATE NOT NULL,
    image TEXT
);