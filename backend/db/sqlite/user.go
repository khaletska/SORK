package sqlite

import (
	"fmt"
	"sn/helpers"
	"sn/models"
	"time"
)

func (d *Database) CreateUser(signUpUser *models.SignupUser) error {
	user := signUpUser.User
	user.IsPublic = true
	query := `INSERT INTO users (first_name, last_name, date_of_birth, email, avatar, nickname, about, is_profile_public, password)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

	_, err := d.db.Exec(query,
		user.FirstName,
		user.LastName,
		user.DateOfBirth,
		user.Email,
		user.Avatar,
		user.Nickname,
		user.About,
		true,
		signUpUser.Password,
	)

	if err != nil {
		return err
	}

	return nil
}

func (d *Database) ReadUsers() (*[]models.User, error) {
	var users []models.User
	query := `SELECT
		id,
		first_name,
		last_name,
		date_of_birth,
		email,
		avatar,
		nickname,
		about,
		is_profile_public
	FROM users`

	rows, err := d.db.Query(query)
	if err != nil {
		fmt.Println("ReadUsers (err in the query)", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var user models.User
		var time time.Time

		err := rows.Scan(
			&user.ID,
			&user.FirstName,
			&user.LastName,
			&time,
			&user.Email,
			&user.Avatar,
			&user.Nickname,
			&user.About,
			&user.IsPublic,
		)
		if err != nil {
			fmt.Println("ReadUsers (err in rows)", err)
			return nil, err
		}

		user.DateOfBirth = time.Local().Format("Jan 02, 2006")

		users = append(users, user)
	}

	return &users, nil
}

func (d *Database) UpdateUser(user *models.User) error {
	query := `UPDATE users SET
		first_name = ?,
		last_name = ?,
		avatar = ?,
		nickname = ?,
		about = ?,
		is_profile_public = ? WHERE id = ?`

	_, err := d.db.Exec(query, user.FirstName, user.LastName, user.Avatar,
		user.Nickname, user.About, user.IsPublic, user.ID)

	if err != nil {
		fmt.Println("UpdateUser", err)
		return err
	}

	return nil
}

func (d *Database) DeleteUser(id int) error {
	query := `DELETE FROM users WHERE id = ?`
	_, err := d.db.Exec(query, id)
	if err != nil {
		return err
	}

	return nil
}

func (d *Database) GetUserByID(id int) (*models.User, error) {
	var user models.User
	var time time.Time
	query := `SELECT
		id,
		first_name,
		last_name,
		date_of_birth,
		email,
		avatar,
		nickname,
		about,
		is_profile_public
	FROM users 
	WHERE id = ?`

	row := d.db.QueryRow(query, id)
	err := row.Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&time,
		&user.Email,
		&user.Avatar,
		&user.Nickname,
		&user.About,
		&user.IsPublic,
	)

	if err != nil {
		fmt.Println("GetUserByID", err)
		return nil, err
	}

	user.DateOfBirth = time.Local().Format("Jan 02, 2006")
	var followers, following, friends *[]models.User
	followers, err = d.GetFollowersByUserID(user.ID)
	following, err = d.GetFollowingByUserID(user.ID)
	friends, err = d.GetCloseFriendsByUserID(user.ID)
	user.Followers = *followers
	user.Following = *following
	user.Friends = *friends
	return &user, nil
}

func (d *Database) GetUsersByGroupID(id int) (*[]models.User, error) {
	var users []models.User
	query := `SELECT 
	u.id,
	u.first_name,
	u.last_name,
	u.date_of_birth,
	u.email,
	u.avatar,
	u.nickname,
	u.about,
	u.is_profile_public
	FROM users AS u
	JOIN group_members AS gm ON u.id = gm.member_id	
	WHERE gm.group_id = ? AND gm.approval_status = 'approved';`

	rows, err := d.db.Query(query, id)
	if err != nil {
		fmt.Println("GetUsersByGroupID (err in the query)", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var user models.User
		var time time.Time
		err := rows.Scan(
			&user.ID,
			&user.FirstName,
			&user.LastName,
			&time,
			&user.Email,
			&user.Avatar,
			&user.Nickname,
			&user.About,
			&user.IsPublic)
		if err != nil {
			fmt.Println("GetUsersByGroupID (err in rows)", err)
			return nil, err
		}

		user.DateOfBirth = time.Local().Format("Jan 02, 2006")

		users = append(users, user)
	}

	return &users, nil
}

func (d *Database) IsUserGroupMember(userID, groupID int) (int, error) {
	var status string
	query := `SELECT approval_status
		FROM group_members
		WHERE group_id = ? AND member_id = ?`

	row := d.db.QueryRow(query, groupID, userID)
	err := row.Scan(
		&status,
	)

	if err != nil {
		return -1, nil
	}
	if status == "pending" {
		return 0, nil
	}
	return 1, nil
}

func (d *Database) AddGroupMember(userID, groupID int) error {
	var count int

	query := `SELECT COUNT(*) 
	FROM group_members WHERE group_id = ? 
	AND member_id = ? 
	AND approval_status = 'pending'`

	err := d.db.QueryRow(query, groupID, userID).Scan(&count)

	if count != 0 {
		fmt.Println("Already existed pending, cancel pending")
		DB.DeleteGroupMember(userID, groupID)
		DB.DeleteJoiningNotification(userID, groupID)
		return nil
	}

	if err != nil {
		fmt.Println("AddGroupMember", err)
		return err
	}

	query = `INSERT INTO group_members (group_id, member_id, approval_status)
	VALUES (?, ?, 'pending')`

	_, err = d.db.Exec(query,
		groupID,
		userID,
	)

	if err != nil {
		fmt.Println("AddGroupMember", err)
		return err
	}

	return nil
}

func (d *Database) ApproveGroupMember(userID, groupID int) error {
	query := `UPDATE group_members SET
	approval_status = 'approved' WHERE group_id = ? AND member_id = ?`

	_, err := d.db.Exec(query, groupID, userID)

	if err != nil {
		fmt.Println("ApproveGroupMember", err)
		return err
	}

	return nil
}

func (d *Database) DeleteGroupMember(userID, groupID int) error {
	query := `DELETE FROM group_members WHERE group_id = ? AND member_id = ?`

	_, err := d.db.Exec(query, groupID, userID)

	if err != nil {
		fmt.Println("DeleteGroupMember", err)
		return err
	}

	return nil
}

func (d *Database) GetFollowersByUserID(id int) (*[]models.User, error) {
	var users []models.User
	query := `SELECT 
	u.id,
	u.first_name,
	u.last_name,
	u.date_of_birth,
	u.email,
	u.avatar,
	u.nickname,
	u.about,
	u.is_profile_public
	FROM users AS u
	JOIN followers AS f ON u.id = f.follower_id	
	WHERE f.user_being_followed_id = ? AND f.is_accepted = 1;`

	rows, err := d.db.Query(query, id)
	if err != nil {
		fmt.Println("GetFollowersByUserID (err in the query)", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var user models.User
		var time time.Time
		err := rows.Scan(
			&user.ID,
			&user.FirstName,
			&user.LastName,
			&time,
			&user.Email,
			&user.Avatar,
			&user.Nickname,
			&user.About,
			&user.IsPublic)
		if err != nil {
			fmt.Println("GetFollowersByUserID (err in rows)", err)
			return nil, err
		}

		user.DateOfBirth = time.Local().Format("Jan 02, 2006")

		users = append(users, user)
	}

	return &users, nil
}

func (d *Database) GetFollowingByUserID(id int) (*[]models.User, error) {
	var users []models.User
	query := `SELECT 
	u.id,
	u.first_name,
	u.last_name,
	u.date_of_birth,
	u.email,
	u.avatar,
	u.nickname,
	u.about,
	u.is_profile_public
	FROM users AS u
	JOIN followers AS f ON u.id = f.user_being_followed_id	
	WHERE f.follower_id = ? AND f.is_accepted = 1;`

	rows, err := d.db.Query(query, id)
	if err != nil {
		fmt.Println("GetFollowingByUserID (err in the query)", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var user models.User
		var time time.Time
		err := rows.Scan(
			&user.ID,
			&user.FirstName,
			&user.LastName,
			&time,
			&user.Email,
			&user.Avatar,
			&user.Nickname,
			&user.About,
			&user.IsPublic)
		if err != nil {
			fmt.Println("GetFollowingByUserID (err in rows)", err)
			return nil, err
		}

		user.DateOfBirth = time.Local().Format("Jan 02, 2006")

		users = append(users, user)
	}

	return &users, nil
}

func (d *Database) GetCloseFriendsByUserID(id int) (*[]models.User, error) {
	var users []models.User
	query := `SELECT 
	u.id,
	u.first_name,
	u.last_name,
	u.date_of_birth,
	u.email,
	u.avatar,
	u.nickname,
	u.about,
	u.is_profile_public
	FROM users AS u
	JOIN followers AS f ON u.id = f.user_being_followed_id	
	WHERE f.follower_id = ? AND f.is_accepted = 1 AND f.is_follower_close_friend = 1;`

	rows, err := d.db.Query(query, id)
	if err != nil {
		fmt.Println("GetFollowingByUserID (err in the query)", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var user models.User
		var time time.Time
		err := rows.Scan(
			&user.ID,
			&user.FirstName,
			&user.LastName,
			&time,
			&user.Email,
			&user.Avatar,
			&user.Nickname,
			&user.About,
			&user.IsPublic)
		if err != nil {
			fmt.Println("GetFollowingByUserID (err in rows)", err)
			return nil, err
		}

		user.DateOfBirth = time.Local().Format("Jan 02, 2006")

		users = append(users, user)
	}

	return &users, nil
}

func (d *Database) CheckNicknameInUse(nickname string) (bool, error) {
	query := "SELECT COUNT(*) FROM users WHERE nickname = ?"
	var count int
	err := d.db.QueryRow(query, nickname).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (d *Database) CheckEmailInUse(email string) (bool, error) {
	query := "SELECT COUNT(*) FROM users WHERE email = ?"
	var count int
	err := d.db.QueryRow(query, email).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (d *Database) CheckPassword(authUser *models.AuthUser) (int, error) {
	user := models.AuthUser{}
	var userID int
	query := `SELECT
		id,
		email,
		password
	FROM users 
	WHERE email = ?`

	row := d.db.QueryRow(query, authUser.Email)
	err := row.Scan(
		&userID,
		&user.Email,
		&user.Password,
	)
	if err != nil {
		return 0, err
	}

	err = helpers.CheckPassword(user.Password, authUser.Password)
	if err != nil {
		return 0, err
	}

	user = models.AuthUser{}
	authUser = nil

	return userID, nil
}
