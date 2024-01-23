package sqlite

import (
	"fmt"
	"sn/models"
	"time"
	"database/sql"
)

func (d *Database) CreateEvent(event *models.CreateEvent) (int, error) {
	query := `INSERT INTO group_events (group_id, author_id, title, description, image, happening_at)
	VALUES (?, ?, ?, ?, ?, ?)`

	res, err := d.db.Exec(query,
		event.GroupID,
		event.AuthorID,
		event.Title,
		event.Description,
		event.Image,
		event.HappeningAt,
	)

	if err != nil {
		return -1, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return -1, err
	}

	return int(id), nil
}

func (d *Database) ReadEvents() (*[]models.Event, error) {
	var events []models.Event
	query := `SELECT
		id,
		group_id,
		author_id,
		title,
		description,
		image,
		happening_at
	FROM group_events`

	rows, err := d.db.Query(query)
	if err != nil {
		fmt.Println("ReadEvents (err in the query)", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var event models.Event
		var groupID int
		var userID int
		var time time.Time

		err := rows.Scan(
			&event.ID,
			&groupID,
			&userID,
			&event.Title,
			&event.Description,
			&event.Image,
			&time,
		)
		if err != nil {
			fmt.Println("ReadEvents (err in rows)", err)
			return nil, err
		}

		author, err := d.GetUserByID(userID)
		if err != nil {
			event.Author.ID = -1
			event.Author.FirstName = "DELETED"
			event.Author.LastName = "DELETED"
		} else {
			event.Author = *author
		}
		event.HappeningAt = time.Local().Format("Jan 02, 2006")

		group, _ := d.GetGroupByID(groupID)
		if group != nil {
			event.Group = *group
			events = append(events, event)
		}
	}

	return &events, nil
}

func (d *Database) UpdateEvent(event *models.Event) error {
	query := `UPDATE group_events SET
		title = ?,
		description = ?,
		image = ?,
		happening_at = ? WHERE id = ?`

	_, err := d.db.Exec(query, event.Title, event.Description, event.Image, event.HappeningAt, event.ID)

	if err != nil {
		fmt.Println("UpdateEvent", err)
		return err
	}

	return nil
}

func (d *Database) DeleteEvent(id int) error {
	query := `DELETE FROM group_events WHERE id = ?`
	_, err := d.db.Exec(query, id)
	if err != nil {
		return err
	}

	return nil
}

func (d *Database) GetEventByID(id int) (*models.Event, error) {
	var event models.Event
	var groupID int
	var userID int
	var time time.Time
	query := `SELECT
		id,
		group_id,
		author_id,
		title,
		description,
		image,
		happening_at
	FROM group_events 
	WHERE id = ?`

	row := d.db.QueryRow(query, id)
	err := row.Scan(
		&event.ID,
		&groupID,
		&userID,
		&event.Title,
		&event.Description,
		&event.Image,
		&event.HappeningAt,
	)

	if err != nil {
		fmt.Println("GetEventByID", err)
		return nil, err
	}

	author, err := d.GetUserByID(userID)
	if err != nil {
		event.Author.ID = -1
		event.Author.FirstName = "DELETED"
		event.Author.LastName = "DELETED"
	} else {
		event.Author = *author
	}
	event.HappeningAt = time.Local().Format("Jan 02, 2006")

	group, err := d.GetGroupByID(groupID)
	if err != nil {
		event.Group.ID = -1
		event.Group.Name = "DELETED"
		event.Group.Description = "DELETED"
	} else {
		event.Group = *group
	}

	return &event, nil
}

func (d *Database) GetEventsByGroupID(groupID, currentUserID int) (*[]models.Event, error) {
	var events []models.Event
	query := `SELECT id, group_id, author_id, title, description, image, happening_at FROM group_events WHERE group_id = ? ORDER BY id desc`

	rows, err := d.db.Query(query, groupID)
	if err != nil {
		fmt.Println("GetEventsByGroupID (err in the query)", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var event models.Event
		var eventID int
		var groupID int
		var userID int
		var time time.Time
		var participants *[]models.User
		err := rows.Scan(&eventID, &groupID, &userID, &event.Title, &event.Description, &event.Image, &time)
		if err != nil {
			fmt.Println("GetEventsByGroupID (err in rows)", err)
			return nil, err
		}

		author, err := d.GetUserByID(userID)
		if err != nil {
			event.Author.ID = -1
			event.Author.FirstName = "DELETED"
			event.Author.LastName = "DELETED"
		} else {
			event.Author = *author
		}
		event.HappeningAt = time.Format("Jan 02, 2006 at 15:04")
		participants, _ = d.GetParticipantsByEventID(eventID)
		event.Participants = *participants
		event.ID = eventID

		event.IsCurrentUserGoing = d.GetParticipationStatusByUserId(currentUserID, eventID) 

		group, _ := d.GetGroupByID(groupID)
		event.Group = *group

		events = append(events, event)
	}

	if len(events) == 0 {
		events = []models.Event{}
	}

	return &events, nil
}

func (d *Database) GetParticipantsByEventID(id int) (*[]models.User, error) {
	var participants []models.User

	query := `SELECT member_id FROM event_participants WHERE event_id = ? AND is_going = 1`
	rows, err := d.db.Query(query, id)

	if err != nil {
		fmt.Println("GetParticipantsByEventID", err)
		return nil, err
	}

	for rows.Next() {
		var memberID int

		err := rows.Scan(
			&memberID,
		)

		if err != nil {
			fmt.Println("GetParticipantsByEventID", err)
			continue
		}

		member, err := d.GetUserByID(memberID)
		if err != nil {
			fmt.Println("GetParticipantsByEventID", err)
			continue
		}

		participants = append(participants, *member)
	}

	if len(participants) == 0 {
		participants = []models.User{}
		return &participants, nil
	}

	return &participants, nil
}

func (d *Database) GetParticipationStatusByUserId(userID, eventID int) (sql.NullBool) {
	var response sql.NullBool

	query := `SELECT is_going FROM event_participants WHERE member_id = ? AND event_id=?`

	err := d.db.QueryRow(query, userID, eventID).Scan(&response)

	if err == sql.ErrNoRows {
		//if there is no such user-event combination in DB, it means this user has not selected any answer yet
		response.Bool=false;
		response.Valid = false;
	}

	return response
}

func (d *Database) UpdateEventParticipationStatus(participation *models.EventParticipationStatus) error {

	query:= ""

	switch d.GetParticipationStatusByUserId(participation.MemberID, participation.EventID).Valid {
		case false:
			query=`INSERT INTO event_participants (is_going, event_id, member_id) VALUES (?,?,?)`
		default:
			query = `UPDATE event_participants SET is_going = ? WHERE event_id = ? AND member_id = ?`
	}


	_, err := d.db.Exec(query, participation.IsParticipating, participation.EventID, participation.MemberID)

	if err != nil {
		fmt.Println("Error with UpdateEventParticipationStatus: ", err)
		return err
	}

	return nil
}