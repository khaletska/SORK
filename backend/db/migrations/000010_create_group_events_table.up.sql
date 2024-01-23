-- +migrate Up
CREATE TABLE group_events (
    id INTEGER PRIMARY KEY,
    group_id INTEGER REFERENCES groups (id),
    author_id INTEGER REFERENCES users (id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT,
    happening_at DATE NOT NULL
);