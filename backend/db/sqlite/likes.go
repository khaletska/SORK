package sqlite

func (d *Database) GetLikesByPostID(id int) int {
	var likes int

	query := `SELECT COUNT(*) FROM likes WHERE post_id = ?`

	row := d.db.QueryRow(query, id)
	err := row.Scan(&likes)
	if err != nil {
		return 0
	}

	return likes
}

func (d *Database) IsPostLikedByUser(userID, postID int) (bool, error) {
	var count int

	query := `SELECT COUNT(*) 
	FROM likes WHERE post_id = ? 
	AND liked_user_id = ?`

	err := d.db.QueryRow(query, postID, userID).Scan(&count)
	if err != nil {
		return false, err
	}
	if count == 0 {
		return false, nil
	}
	return true, nil
}

func (d *Database) AddLike(userID, postID int) error {
	var count int

	query := `SELECT COUNT(*) 
	FROM likes WHERE post_id = ? 
	AND liked_user_id = ?`

	err := d.db.QueryRow(query, postID, userID).Scan(&count)
	if err != nil {
		return err
	}

	if count != 0 {
		DB.DeleteLike(userID, postID)
		return nil
	}

	query = `INSERT INTO likes (post_id, liked_user_id)
		VALUES (?, ?)`

	_, err = d.db.Exec(query,
		postID,
		userID,
	)

	if err != nil {
		return err
	}

	return nil
}

func (d *Database) DeleteLike(userID, postID int) error {
	query := `DELETE FROM likes WHERE post_id = ? AND liked_user_id = ?`
	_, err := d.db.Exec(query, postID, userID)
	if err != nil {
		return err
	}

	return nil
}
