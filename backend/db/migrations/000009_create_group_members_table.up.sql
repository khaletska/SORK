-- +migrate Up
CREATE TABLE group_members (
    id INTEGER PRIMARY KEY,
    group_id INTEGER REFERENCES groups (id),
    member_id INTEGER REFERENCES users (id),
    approval_status TEXT NOT NULL
);