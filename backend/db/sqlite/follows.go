package sqlite

import (
	"fmt"
	"sn/models"
)

func (d *Database) GetFollowersByGroupID(id int) (*[]models.User, error) {
	var followers []models.User

	query := `SELECT member_id FROM group_members WHERE group_id = ? AND approval_status = "approved"`
	rows, err := d.db.Query(query, id)

	if err != nil {
		fmt.Println("GetFollowersByGroupID", err)
		return nil, err
	}

	for rows.Next() {
		var memberID int

		err := rows.Scan(
			&memberID,
		)

		if err != nil {
			fmt.Println("GetFollowersByGroupID", err)
			continue
		}

		member, err := d.GetUserByID(memberID)
		if err != nil {
			fmt.Println("GetFollowersByGroupID", err)
			continue
		}

		followers = append(followers, *member)
	}

	if len(followers) == 0 {
		followers = []models.User{}
		return &followers, nil
	}

	return &followers, nil
}

func (d *Database) AddFollowing(followerID, userID int) error {
	query := `INSERT INTO followers (follower_id, user_being_followed_id, is_accepted, is_follower_close_friend)
	VALUES (?, ?, ?, ?)`

	_, err := d.db.Exec(query,
		followerID,
		userID,
		0,
		0,
	)

	if err != nil {
		return err
	}

	return nil
}

// to delete following firstly should be person's id who want to delete and to delete follower - as a second parameter
func (d *Database) RemoveFollows(followerID, userID int) error {
	query := `DELETE FROM followers WHERE follower_id = ? AND user_being_followed_id = ?`
	_, err := d.db.Exec(query, followerID, userID)
	if err != nil {
		return err
	}

	return nil
}

func (d *Database) AcceptFriend(userID, followerID int) error {
	query := `UPDATE followers SET is_accepted = 1 WHERE follower_id = ? AND user_being_followed_id = ?`
	_, err := d.db.Exec(query, followerID, userID)
	if err != nil {
		return err
	}

	return nil
}

func (d *Database) CheckFriendStatus(userID, followerID int) (string, error) {
	var res int
	query := `SELECT is_accepted FROM followers
	WHERE follower_id = ? AND user_being_followed_id = ?;`
	row := d.db.QueryRow(query, followerID, userID)
	err := row.Scan(
		&res,
	)
	if err != nil {
		return models.NotFriends, nil
	}
	if res == 0 {
		return models.PendingFriend, nil
	}

	mod, _ := d.CheckCloseFriendStatus(userID, followerID)
	if mod == models.NotFriends {
		return models.Friends, nil
	}
	return mod, nil
}

func (d *Database) CheckCloseFriendStatus(userID, followerID int) (string, error) {
	var res int
	query := `SELECT is_follower_close_friend FROM followers
	WHERE follower_id = ? AND user_being_followed_id = ?;`
	row := d.db.QueryRow(query, userID, followerID)
	err := row.Scan(
		&res,
	)
	if err != nil {
		return models.NotFriends, nil
	}
	if res == 1 {
		return models.CloseFriends, nil
	}
	return models.Friends, nil
}

// to add a person to close friends toAdd = 1, to delete - 0
func (d *Database) UpdateFriend(userID, CFID, toAdd int) error {
	query := `UPDATE followers SET is_follower_close_friend = ? WHERE follower_id = ? AND user_being_followed_id = ? AND is_accepted = 1`
	_, err := d.db.Exec(query, toAdd, userID, CFID)
	if err != nil {
		return err
	}

	return nil
}

// followers of given user that are not members of the given group and not yet invited to the group either
func (d *Database) GetFollowersNotYetMembersByUserID(userID int, groupID int) (*[]models.User, error) {
	var users []models.User
	query := `SELECT 
	u.id,
	u.first_name,
	u.last_name,
	u.avatar
	FROM users AS u
	JOIN followers AS f ON u.id = f.follower_id	
	LEFT JOIN (SELECT member_id, approval_status from group_members WHERE group_id = ?) as m ON u.id = m.member_id
	WHERE (f.user_being_followed_id = ? AND f.is_accepted = 1) AND m.approval_status IS NULL;`

	rows, err := d.db.Query(query, groupID, userID)
	if err != nil {
		fmt.Println("GetFollowersNotYetMembersByUserID (err in the query)", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var user models.User
		err := rows.Scan(
			&user.ID,
			&user.FirstName,
			&user.LastName,
			&user.Avatar,
		)
		if err != nil {
			fmt.Println("GetFollowersNotYetMembersByUserID (err in rows)", err)
			return nil, err
		}
		users = append(users, user)
	}

	if len(users) == 0 {
		users = []models.User{}
	}

	return &users, nil
}
