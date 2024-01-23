-- +migrate Up
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY,
    receiver_id INTEGER REFERENCES users (id),
    data TEXT NOT NULL,
    is_read INTEGER NOT NULL,
    timestamp DATE NOT NULL
);