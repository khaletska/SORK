-- +migrate Up
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT,
    nickname TEXT,
    about TEXT,
    is_profile_public INTEGER,
    UNIQUE(email, nickname)
);