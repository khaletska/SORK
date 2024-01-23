package sqlite

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"sn/models"
	"time"
)

func (d *Database) CreateNotification(notification *models.Notification) error {

	notification.Data.LeftEntity = models.NotificationEntity{}
	notification.Data.RightEntity = models.NotificationEntity{}

	query := `INSERT INTO notifications (receiver_id, data, is_read, timestamp)
	VALUES (?, ?, ?, datetime('now'))`

	jsonNotificationData, err := json.Marshal(notification.Data)
	if err != nil {
		fmt.Println("CreateNotification error marshalling JSON:", err)
	}

	_, err = d.db.Exec(query,
		notification.ReceiverID,
		jsonNotificationData,
		notification.IsRead,
	)

	if err != nil {
		return err
	}

	return nil
}

func (d *Database) GetChatNotificationsByUserID(id int) (*[]models.Notification, error) {
	var notifications []models.Notification
	query := `SELECT
		n.id,
		n.receiver_id,
		n.data,
		n.is_read,
		n.timestamp
	FROM notifications AS n
	JOIN group_members AS gm ON JSON_EXTRACT(n.data, '$.groupID') = gm.group_id
	WHERE gm.member_id = ? 
		AND gm.approval_status = 'approved' 
		AND JSON_EXTRACT(n.data, '$.type') = 'chat'
		AND JSON_EXTRACT(n.data, '$.senderID') != ?;`

	rows, err := d.db.Query(query, id, id)
	if err != nil {
		fmt.Println("ReadNotifications (err in the query)", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var notification models.Notification
		var time time.Time
		var data string

		err := rows.Scan(
			&notification.ID,
			&notification.ReceiverID,
			&data,
			&notification.IsRead,
			&time,
		)
		if err != nil {
			fmt.Println("ReadNotifications (err in rows)", err)
			return nil, err
		}

		var notificationData *models.NotificationData

		// Convert JSON to struct
		err = json.Unmarshal([]byte(data), &notificationData)
		if err != nil {
			fmt.Println("Error unmarshalling JSON:", err)
		}

		convertNotificationData(notificationData)

		notification.Data = *notificationData
		notification.Timestamp = time.Local().Format("Jan 02, 2006")
		notifications = append(notifications, notification)
	}

	return &notifications, nil
}

func (d *Database) GetNotificationsByUserID(id int) (*[]models.Notification, error) {
	var notifications []models.Notification
	query := `SELECT
		id,
		receiver_id,
		data,
		is_read,
		timestamp
	FROM notifications
	WHERE receiver_id = ?`

	rows, err := d.db.Query(query, id)
	if err != nil {
		fmt.Println("ReadNotifications (err in the query)", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var notification models.Notification
		var time time.Time
		var data string

		err := rows.Scan(
			&notification.ID,
			&notification.ReceiverID,
			&data,
			&notification.IsRead,
			&time,
		)
		if err != nil {
			fmt.Println("ReadNotifications (err in rows)", err)
			return nil, err
		}

		var notificationData *models.NotificationData

		// Convert JSON to struct
		err = json.Unmarshal([]byte(data), &notificationData)
		if err != nil {
			fmt.Println("Error unmarshalling JSON:", err)
		}

		convertNotificationData(notificationData)

		notification.Data = *notificationData
		notification.Timestamp = time.Local().Format("Jan 02, 2006")
		notifications = append(notifications, notification)
	}

	return &notifications, nil
}

func (d *Database) GetNotificationByID(id int) (*models.Notification, error) {
	var notification models.Notification
	var time time.Time
	var data string
	query := `SELECT
			id,
			receiver_id,
			data,
			is_read,
			timestamp
		FROM notifications
		WHERE id = ?`
	row := d.db.QueryRow(query, id)
	err := row.Scan(
		&notification.ID,
		&notification.ReceiverID,
		&data,
		&notification.IsRead,
		&time,
	)
	if err != nil {
		fmt.Println("ReadNotifications (err in rows)", err)
		return nil, err
	}

	var notificationData *models.NotificationData

	// Convert JSON to struct
	err = json.Unmarshal([]byte(data), &notificationData)

	convertNotificationData(notificationData)

	notification.Data = *notificationData
	notification.Timestamp = time.Local().Format("Jan 02, 2006")

	return &notification, nil
}

func (d *Database) UpdateNotification(notification *models.Notification) error {
	query := `UPDATE notifications SET
		is_read = 1 WHERE id = ?`

	_, err := d.db.Exec(query, notification.ID)

	if err != nil {
		fmt.Println("UpdateNotification", err)
		return err
	}

	return nil
}

func (d *Database) DeleteNotification(id int) error {
	query := `DELETE FROM notifications WHERE id = ?`
	_, err := d.db.Exec(query, id)
	if err != nil {
		return err
	}

	return nil
}

func (d *Database) DeleteJoiningNotification(senderID, groupID int) error {
	sqlStmt := `
		DELETE FROM notifications
		WHERE JSON_EXTRACT(data, '$.senderID') = ?
		AND JSON_EXTRACT(data, '$.groupID') = ?
		AND JSON_EXTRACT(data, '$.type') = 'joining';
	`

	stmt, err := d.db.Prepare(sqlStmt)
	if err != nil {
		fmt.Println(err)
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(senderID, groupID)
	if err != nil {
		fmt.Println(err)
		return err
	}

	fmt.Println("Rows deleted successfully.")
	return nil
}

func (d *Database) DeleteFollowingNotification(senderID, receiverID int) error {
	sqlStmt := `
		DELETE FROM notifications
		WHERE JSON_EXTRACT(data, '$.senderID') = ?
		AND receiver_id = ?
		AND JSON_EXTRACT(data, '$.type') = 'following';
	`

	stmt, err := d.db.Prepare(sqlStmt)
	if err != nil {
		fmt.Println(err)
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(senderID, receiverID)
	if err != nil {
		fmt.Println(err)
		return err
	}

	fmt.Println("Rows deleted successfully.")
	return nil
}

func convertNotificationData(notificationData *models.NotificationData) error {
	// set LeftEntity properties
	setLeftEntity := func(id int, name string, avatar sql.NullString) {
		notificationData.LeftEntity.ID = id
		notificationData.LeftEntity.Name = name
		notificationData.LeftEntity.Image = avatar
	}

	// set RightEntity properties
	setRightEntity := func(id int, name string, image sql.NullString) {
		notificationData.RightEntity.ID = id
		notificationData.RightEntity.Name = name
		notificationData.RightEntity.Image = image
	}

	switch notificationData.Type {
	case "following", "invitation", "joining", "like", "following_public":
		sender, err := DB.GetUserByID(notificationData.SenderID)
		if err != nil {
			fmt.Println("Error getting user in convertNotificationData:", err)
			return err
		}
		setLeftEntity(sender.ID, sender.FirstName+" "+sender.LastName, sender.Avatar)

		if notificationData.Type == "invitation" || notificationData.Type == "joining" {
			group, err := DB.GetGroupByID(notificationData.GroupID)
			if err != nil {
				fmt.Println("Error getting group in convertNotificationData:", err)
				return err
			}
			setRightEntity(group.ID, group.Name, group.Image)
		} else if notificationData.Type == "like" {
			post, err := DB.GetPostByID(notificationData.PostID)
			if err != nil {
				fmt.Println("Error getting post in convertNotificationData:", err)
				return err
			}
			setRightEntity(post.ID, post.Title, post.Image)
		}

	case "newEvent":
		event, _ := DB.GetEventByID(notificationData.EventID)
		notificationData.LeftEntity.ID = event.ID
		notificationData.LeftEntity.Name = event.Title
		if event.Image.Valid {
			notificationData.LeftEntity.Image = sql.NullString{
				String: event.Image.String,
				Valid:  true,
			}
		}
		group, _ := DB.GetGroupByID(notificationData.GroupID)
		notificationData.RightEntity.ID = group.ID
		notificationData.RightEntity.Name = group.Name
		if group.Image.Valid {
			notificationData.RightEntity.Image = sql.NullString{
				String: group.Image.String,
				Valid:  true,
			}
		}
	case "comment":
		sender, err := DB.GetUserByID(notificationData.SenderID)
		if err != nil {
			fmt.Println("Error getting user in convertNotificationData:", err)
			return err
		}
		setLeftEntity(sender.ID, sender.FirstName+" "+sender.LastName, sender.Avatar)

		post, err := DB.GetPostByID(notificationData.PostID)
		if err != nil {
			fmt.Println("Error getting post in convertNotificationData:", err)
			return err
		}
		setRightEntity(post.ID, post.Title, post.Image)

	case "chat":
		// sender
		notificationData.LeftEntity.ID = notificationData.SenderID

		// chat or group
		if notificationData.GroupID != 0 {
			notificationData.RightEntity.ID = notificationData.GroupID
			notificationData.RightEntity.Name = "group"
		} else {
			notificationData.RightEntity.ID = notificationData.ChatID
			notificationData.RightEntity.Name = "chat"
		}
	}

	return nil
}

func (d *Database) SetUsersChatNotificationsSeen(userID int) error {
	query := `UPDATE notifications SET
		is_read = 1 WHERE json_extract(data, '$.type')="chat" AND receiver_id = ?`

	_, err := d.db.Exec(query, userID)

	return err
}
