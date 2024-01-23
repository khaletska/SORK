package sqlite

import (
	"fmt"
	"sn/models"
	"time"
)

func (d *Database) CreateComment(comment *models.Comment) error {
	query := `
		INSERT INTO comments (post_id, author_id, content, image, created_at)
		VALUES (?, ?, ?, ?, datetime('now'))`
	_, err := d.db.Exec(query, comment.PostID, comment.Author.ID, comment.Content, comment.Image)
	if err != nil {
		fmt.Println("CreatePost", err)
		return err
	}
	return nil
}

func (d *Database) GetCommentsByPostID(id int) (*[]models.Comment, error) {
	var comments []models.Comment

	query := `SELECT * FROM comments WHERE post_id = ?`
	rows, err := d.db.Query(query, id)

	if err != nil {
		fmt.Println("GetCommentsByPostID", err)
		return nil, err
	}

	for rows.Next() {
		var comment models.Comment
		var authorID int
		var time time.Time

		err := rows.Scan(
			&comment.ID,
			&comment.PostID,
			&authorID,
			&comment.Content,
			&time,
			&comment.Image,
		)

		if err != nil {
			fmt.Println("GetCommentsByPostID", err)
			continue
		}

		author, err := d.GetUserByID(authorID)
		if err != nil {
			comment.Author.ID = -1
			comment.Author.FirstName = "DELETED"
			comment.Author.LastName = "DELETED"
		} else {
			comment.Author = *author
		}

		comment.CreatedAT = time.Local().Format("Jan 02, 2006")
		comments = append(comments, comment)
	}

	if len(comments) == 0 {
		comments = []models.Comment{}
		return &comments, nil
	}

	return &comments, nil
}
