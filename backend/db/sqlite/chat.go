package sqlite

import (
	"database/sql"
	"errors"
	"fmt"
	"sn/models"
	"sort"
	"time"
)

func (d *Database) CreateChat(userID1, userID2 int) (*int, error) {
	var chatID int
	query := `
		INSERT INTO private_chats (user1_id, user2_id)
		VALUES (?, ?) RETURNING id`
	row := d.db.QueryRow(query, userID1, userID2)
	err := row.Scan(&chatID)

	if err != nil {
		fmt.Println("Error creating chat - /db/chat.go", err)
		return nil, err
	}

	return &chatID, nil
}

func (d *Database) DeleteChat(id int) error {
	query := `DELETE FROM private_chats WHERE id = ?`
	_, err := d.db.Exec(query, id)
	if err != nil {
		fmt.Println("DeleteChat", err)
		return err
	}
	return nil
}

func (d *Database) GetChatHistory(chat *models.Chat) error {
	messages := []models.Message{}
	var err error
	if chat.IsGroup {
		messages, err = DB.GetMessagesByChatID("group", chat.ChatName.ID)
	} else {
		messages, err = DB.GetMessagesByChatID("private", chat.ID)
	}

	if err != nil {
		fmt.Println(err)
		return err
	}
	chat.ChatHistory = messages

	return nil
}

// TODO sort chats by the last messages timestamp
func (d *Database) GetChatsByUserID(id int) ([]models.Chat, error) {
	// -- private chats --
	var chats []models.Chat
	query := `SELECT pc.id AS chat_id,
			pc.user1_id,
			pc.user2_id,
			m.id
		FROM private_chats pc
		LEFT JOIN (
		SELECT chat_id,
			MAX(timestamp) AS last_message_timestamp
		FROM messages
		WHERE chat_type = 'private'
		GROUP BY chat_id
		) AS subquery
		ON pc.id = subquery.chat_id
		LEFT JOIN messages m
		ON pc.id = m.chat_id AND subquery.last_message_timestamp = m.timestamp
		WHERE pc.user1_id = ? OR pc.user2_id = ?`
	rows, err := d.db.Query(query, id, id)
	if err != nil {
		fmt.Println("GetChatsByUserID (err in the query)", err)
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var chat models.Chat
		var user1ID int
		var user2ID int
		var theLastMID sql.NullInt64
		err := rows.Scan(&chat.ID, &user1ID, &user2ID, &theLastMID)
		if err != nil {
			fmt.Println("GetChatsByUserID (err in rows)", err)
			return nil, err
		}

		if theLastMID.Valid == true {
			lastMessage, err := DB.GetMessageByID(int(theLastMID.Int64))
			if err != nil {
				fmt.Println("lastMessage err", err)
				return nil, err
			}
			chat.ChatHistory = append(chat.ChatHistory, *lastMessage)
		}

		currUserID := user1ID
		otherID := user2ID

		if user2ID == id {
			currUserID = user2ID
			otherID = user1ID
		}

		currUser, err := d.GetUserByID(currUserID)
		if err != nil {
			fmt.Println("GetChatByID currUser err", err)
		} else {
			chat.CurrUser = *currUser
		}

		other, err := d.GetUserByID(otherID)
		if err != nil {
			chat.ChatName.ID = -1
			chat.ChatName.Name = "DELETED"
		} else {
			chat.ChatName.ID = other.ID
			chat.ChatName.Name = other.FirstName + " " + other.LastName
			chat.ChatName.Image = other.Avatar
		}

		chat.IsGroup = false

		chats = append(chats, chat)
	}

	// -- group chats --
	query = `SELECT g.id,
			g.name,
			g.image,
			m.id
		FROM groups AS g
		JOIN group_members AS gm
		ON g.id = gm.group_id
		LEFT JOIN (
		SELECT chat_id,
			MAX(timestamp) AS last_message_timestamp
		FROM messages
		WHERE chat_type = 'group'
		GROUP BY chat_id
		) AS subquery
		ON g.id = subquery.chat_id
		LEFT JOIN messages m
		ON subquery.chat_id = m.chat_id AND subquery.last_message_timestamp = m.timestamp
		WHERE gm.member_id = ? AND gm.approval_status = 'approved'
		ORDER BY subquery.last_message_timestamp DESC`
	rows, err = d.db.Query(query, id, id)
	if err != nil {
		fmt.Println("GetChatsByUserID (err in the query)", err)
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var chat models.Chat
		var theLastMID sql.NullInt64
		err := rows.Scan(&chat.ChatName.ID, &chat.ChatName.Name,
			&chat.ChatName.Image, &theLastMID)

		if theLastMID.Valid == true {
			lastMessage, err := DB.GetMessageByID(int(theLastMID.Int64))
			if err != nil {
				fmt.Println("lastMessage err", err)
				return nil, err
			}
			chat.ChatHistory = append(chat.ChatHistory, *lastMessage)
		}

		if err != nil {
			fmt.Println("GetChatsByUserID (err in rows)", err)
			return nil, err
		}

		currUser, err := d.GetUserByID(id)
		if err != nil {
			fmt.Println("GetChatByID currUser err", err)
		} else {
			chat.CurrUser = *currUser
		}
		chat.ID = chat.ChatName.ID
		chat.IsGroup = true

		chats = append(chats, chat)
	}

	sort.Slice(chats, func(i, j int) bool {
		// Get the SentAT of the latest message in each chat
		sentAT1 := time.Time{}
		if len(chats[i].ChatHistory) > 0 {
			sentAT1, _ = time.Parse("02/01/2006 15:04", chats[i].ChatHistory[0].SentAT)
		}

		sentAT2 := time.Time{}
		if len(chats[j].ChatHistory) > 0 {
			sentAT2, _ = time.Parse("02/01/2006 15:04", chats[j].ChatHistory[0].SentAT)
		}

		// Compare the SentAT timestamps
		if sentAT1.IsZero() && sentAT2.IsZero() {
			return false // Both have no messages
		} else if sentAT1.IsZero() {
			return false // Chat i has no message, move it to the end
		} else if sentAT2.IsZero() {
			return true // Chat j has no message, move it to the end
		} else {
			return sentAT1.After(sentAT2)
		}
	})

	if len(chats) == 0 {
		return []models.Chat{}, nil
	}
	return chats, nil
}

func (d *Database) AddMessage(message *models.Message) error {
	query := `
	INSERT INTO messages (chat_id, chat_type, sender_id, message_content, timestamp)
	VALUES (?, ?, ?, ?, datetime('now'))`

	res, err := d.db.Exec(query, message.ChatID, message.Type, message.Sender.ID, message.Content)
	if err != nil {
		fmt.Println("AddMessage", err)
		return err
	}

	// Get the last inserted ID
	id, _ := res.LastInsertId()

	// Get the timestamp of the newly inserted message from the database
	var time time.Time
	err = d.db.QueryRow("SELECT timestamp FROM messages WHERE id = ?", id).Scan(&time)
	if err != nil {
		fmt.Println("AddMessage", err)
		return err
	}

	// Update the message struct with the retrieved values
	message.ID = int(id)
	message.SentAT = time.Local().Format("02/01/2006 15:04")

	return nil
}

func (d *Database) GetMessagesByChatID(chatType string, chatID int) ([]models.Message, error) {
	var messages []models.Message
	query := `SELECT id, sender_id, message_content, timestamp FROM messages WHERE chat_id = ? AND chat_type = ?`
	rows, err := d.db.Query(query, chatID, chatType)
	if err != nil {
		fmt.Println("GetMessagesByChatID (err in the query)", err)
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var message models.Message
		var senderID int
		var time time.Time
		err := rows.Scan(&message.ID, &senderID, &message.Content, &time)
		if err != nil {
			fmt.Println("GetChatByID (err in rows)", err)
			return nil, err
		}
		sender, err := d.GetUserByID(senderID)
		if err != nil {
			message.Sender.ID = -1
			message.Sender.FirstName = "DELETED"
			message.Sender.LastName = "DELETED"
		} else {
			message.Sender = *sender
		}
		message.SentAT = time.Local().Format("02/01/2006 15:04")

		messages = append(messages, message)
	}

	if len(messages) == 0 {
		return []models.Message{}, nil
	}

	return messages, nil
}

func (d *Database) GetMessageByID(id int) (*models.Message, error) {
	var message models.Message
	var senderID int
	var time time.Time
	query := `SELECT id, sender_id, message_content, timestamp FROM messages WHERE id = ?`

	row := d.db.QueryRow(query, id)
	err := row.Scan(
		&message.ID,
		&senderID,
		&message.Content,
		&time,
	)

	if err != nil {
		fmt.Println("GetMessageByID", err)
		return nil, err
	}

	sender, err := d.GetUserByID(senderID)
	if err != nil {
		message.Sender.ID = -1
		message.Sender.FirstName = "DELETED"
		message.Sender.LastName = "DELETED"
	} else {
		message.Sender = *sender
	}
	message.SentAT = time.Local().Format("02/01/2006 15:04")
	return &message, nil
}

func (d *Database) CheckExistingChat(currentUserID, userID int) (*int, error) {
	var chatID int
	query := `SELECT id FROM private_chats WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`
	row := d.db.QueryRow(query, currentUserID, userID, userID, currentUserID)
	err := row.Scan(
		&chatID,
	)

	if err != nil {
		if errors.Is(sql.ErrNoRows, err) {
			return nil, nil
		}
		return nil, err
	}

	return &chatID, nil
}
