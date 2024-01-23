package sqlite

import (
	"fmt"
	"sn/models"
	"strings"
	"time"
)

func (d *Database) CreatePost(post *models.Post) (int, error) {
	query := `
		INSERT INTO posts (title, content, author_id, group_id, privacy_level, image, creation_time)
		VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
	res, err := d.db.Exec(query, post.Title, post.Content, post.Author.ID, post.GroupID, strings.ToLower(post.Privacy), post.Image)
	if err != nil {
		fmt.Println("CreatePost", err)
		return -1, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		fmt.Println("CreatePost - LastInsertId", err)
		return -1, err
	}

	return int(id), nil
}

func (d *Database) ReadPosts(id int) (*[]models.Post, error) {
	var posts []models.Post
	query := `SELECT id, title, content, author_id, creation_time, group_id, privacy_level, image 
	FROM posts 
	WHERE privacy_level = 'public' AND group_id IS NULL
	
	UNION ALL
	
	SELECT p.id, p.title, p.content, p.author_id, p.creation_time, p.group_id, p.privacy_level, p.image 
	FROM posts AS p
	JOIN group_members AS gm ON p.group_id = gm.group_id	
	WHERE gm.member_id = ? AND gm.approval_status = 'approved'
	
	UNION ALL
	
	SELECT p.id, p.title, p.content, p.author_id, p.creation_time, p.group_id, p.privacy_level, p.image 
	FROM posts AS p
	JOIN followers AS f ON p.author_id = f.user_being_followed_id	
	WHERE f.follower_id = ? AND f.is_accepted = 1 AND p.privacy_level = 'private'
	
	UNION ALL
	
	SELECT p.id, p.title, p.content, p.author_id, p.creation_time, p.group_id, p.privacy_level, p.image 
	FROM posts AS p
	JOIN followers AS f ON p.author_id = f.follower_id
	WHERE f.user_being_followed_id = ? AND f.is_accepted = 1 AND f.is_follower_close_friend = 1 AND p.privacy_level = 'close friends'
	
	ORDER BY creation_time DESC`
	rows, err := d.db.Query(query, id, id, id)
	if err != nil {
		fmt.Println("getAllPublicPosts (err in the query)", err)
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var post models.Post
		var time time.Time
		var creatorID int
		err := rows.Scan(&post.ID, &post.Title, &post.Content, &creatorID, &time, &post.GroupID, &post.Privacy, &post.Image)
		if err != nil {
			fmt.Println("getAllPublicPosts (err in rows)", err)
			return nil, err
		}
		creator, err := d.GetUserByID(creatorID)
		if err != nil {
			post.Author.ID = -1
			post.Author.FirstName = "DELETED"
			post.Author.LastName = "DELETED"
		} else {
			post.Author = *creator
		}
		post.Likes = d.GetLikesByPostID(post.ID)
		post.CreatedAT = time.Local().Format("Jan 02, 2006")
		posts = append(posts, post)
	}
	return &posts, nil
}

func (d *Database) UpdatePost(post *models.Post) error {
	query := `UPDATE posts SET title = ?, content = ?, privacy_level = ?, image = ? WHERE id = ?`
	_, err := d.db.Exec(query, post.Title, post.Content, post.Privacy, post.Image, post.ID)
	if err != nil {
		fmt.Println("UpdatePost", err)
		return err
	}
	return nil
}

func (d *Database) DeletePost(id int) error {
	query := `DELETE FROM posts WHERE id = ?`
	_, err := d.db.Exec(query, id)
	if err != nil {
		fmt.Println("DeletePost", err)
		return err
	}
	return nil
}

func (d *Database) GetPostByID(id int) (*models.Post, error) {
	var post models.Post
	var authorID int
	var time time.Time
	query := `SELECT * FROM posts WHERE id = ?`
	row := d.db.QueryRow(query, id)
	err := row.Scan(
		&post.ID,
		&post.Title,
		&post.Content,
		&authorID,
		&time,
		&post.GroupID,
		&post.Privacy,
		&post.Image,
	)
	if err != nil {
		return nil, err
	}
	user, err := d.GetUserByID(authorID)
	if err != nil {
		post.Author.ID = -1
		post.Author.FirstName = "DELETED"
		post.Author.LastName = "DELETED"
	} else {
		post.Author = *user
	}
	post.CreatedAT = time.Local().Format("Jan 02, 2006")
	post.Likes = d.GetLikesByPostID(id)
	return &post, nil
}

func (d *Database) GetPostsByGroupID(id int) (*[]models.Post, error) {
	var posts []models.Post
	query := `SELECT id, title, content, author_id, creation_time, group_id, privacy_level, image FROM posts WHERE group_id = ? ORDER BY id DESC`
	rows, err := d.db.Query(query, id)
	if err != nil {
		fmt.Println("GetPostsByGroupID (err in the query)", err)
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var post models.Post
		var time time.Time
		var creatorID int
		err := rows.Scan(&post.ID, &post.Title, &post.Content, &creatorID, &time, &post.GroupID, &post.Privacy, &post.Image)
		if err != nil {
			fmt.Println("GetPostsByGroupID (err in rows)", err)
			return nil, err
		}
		creator, err := d.GetUserByID(creatorID)
		if err != nil {
			post.Author.ID = -1
			post.Author.FirstName = "DELETED"
			post.Author.LastName = "DELETED"
		} else {
			post.Author = *creator
		}
		post.Likes = d.GetLikesByPostID(post.ID)
		post.CreatedAT = time.Local().Format("Jan 02, 2006")
		posts = append(posts, post)
	}

	if len(posts) == 0 {
		posts = []models.Post{}
		return &posts, nil
	}

	return &posts, nil
}

func (d *Database) GetPostsByUserID(id int) (*[]models.Post, error) {
	var posts []models.Post
	query := `SELECT id, title, content, creation_time, group_id, privacy_level, image
	FROM posts
	WHERE author_id = ?
	ORDER BY creation_time DESC;`
	rows, err := d.db.Query(query, id)
	if err != nil {
		fmt.Println("GetPostsByGroupID (err in the query)", err)
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var post models.Post
		var time time.Time
		err := rows.Scan(&post.ID, &post.Title, &post.Content, &time, &post.GroupID, &post.Privacy, &post.Image)
		if err != nil {
			fmt.Println("GetPostsByGroupID (err in rows)", err)
			return nil, err
		}
		creator, err := d.GetUserByID(id)
		post.Author = *creator
		post.Likes = d.GetLikesByPostID(post.ID)
		post.CreatedAT = time.Local().Format("Jan 02, 2006")
		posts = append(posts, post)
	}
	return &posts, nil
}

func (d *Database) GetPostsByUserIDandRelation(id int, relation string) (*[]models.Post, error) {
	var posts []models.Post

	var privacyLevels []string
	switch relation {
	case "friends":
		privacyLevels = []string{"private", "public"}
	case "close_friends":
		privacyLevels = []string{"private", "public", "close friends"}
	default:
		privacyLevels = []string{"public"}
	}

	placeholders := make([]string, len(privacyLevels))
	for i := range privacyLevels {
		placeholders[i] = "?"
	}

	query := `SELECT id, title, content, creation_time, group_id, privacy_level, image
	FROM posts
	WHERE (author_id = ? AND privacy_level IN (` + strings.Join(placeholders, ",") + `))
	ORDER BY creation_time DESC;`

	args := make([]interface{}, len(privacyLevels)+1)
	args[0] = id
	for i, level := range privacyLevels {
		args[i+1] = level
	}

	rows, err := d.db.Query(query, args...)
	if err != nil {
		fmt.Println("GetPostsByGroupID (err in the query)", err)
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var post models.Post
		var time time.Time
		err := rows.Scan(&post.ID, &post.Title, &post.Content, &time, &post.GroupID, &post.Privacy, &post.Image)
		if err != nil {
			fmt.Println("GetPostsByGroupID (err in rows)", err)
			return nil, err
		}
		creator, err := d.GetUserByID(id)
		post.Author = *creator
		post.Likes = d.GetLikesByPostID(post.ID)
		post.CreatedAT = time.Local().Format("Jan 02, 2006")
		posts = append(posts, post)
	}
	return &posts, nil
}
