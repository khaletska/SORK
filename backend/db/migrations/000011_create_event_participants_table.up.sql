-- +migrate Up
CREATE TABLE event_participants (
    id INTEGER PRIMARY KEY,
    event_id INTEGER REFERENCES group_events (id),
    member_id INTEGER REFERENCES users (id),
    is_going INTEGER
);