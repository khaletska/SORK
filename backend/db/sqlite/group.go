package sqlite

import (
	"fmt"
	"sn/models"
)

func (d *Database) CreateGroup(group *models.Group) (int, error) {
	query := `INSERT INTO groups (name, description, creator_id, image) VALUES (?, ?, ?, ?)`
	res, err := d.db.Exec(query, group.Name, group.Description, group.Creator.ID, group.Image)
	if err != nil {
		fmt.Println("CreateGroup", err)
		return -1, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		fmt.Println("CreatePost - LastInsertId", err)
		return -1, err
	}

	fmt.Println("group.Creator.ID, group.ID", group.Creator.ID, int(id))
	d.AddGroupMember(group.Creator.ID, int(id))
	d.ApproveGroupMember(group.Creator.ID, int(id))

	return int(id), nil
}

func (d *Database) GetGroupByID(id int) (*models.Group, error) {
	var group models.Group
	var creatorID int
	query := `SELECT id, name, description, creator_id, image FROM groups
	WHERE id = ?`
	row := d.db.QueryRow(query, id)
	err := row.Scan(
		&group.ID,
		&group.Name,
		&group.Description,
		&creatorID,
		&group.Image,
	)

	if err != nil {
		fmt.Println("GetGroupById", err)
		return nil, err
	}

	creator, err := d.GetUserByID(creatorID)
	if err != nil {
		group.Creator.ID = -1
		group.Creator.FirstName = "DELETED"
		group.Creator.LastName = "DELETED"
	} else {
		group.Creator = *creator
	}

	return &group, nil
}

func (d *Database) ReadGroups() (*[]models.Group, error) {
	var groups []models.Group
	query := `SELECT id, name, description, creator_id, image FROM groups ORDER BY id DESC`

	rows, err := d.db.Query(query)
	if err != nil {
		fmt.Println("ReadGroups (err in the query)", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var group models.Group
		var creatorID int
		err := rows.Scan(&group.ID, &group.Name, &group.Description, &creatorID, &group.Image)
		if err != nil {
			fmt.Println("ReadGroups (err in rows)", err)
			return nil, err
		}

		creator, err := d.GetUserByID(creatorID)
		if err != nil {
			group.Creator.ID = -1
			group.Creator.FirstName = "DELETED"
			group.Creator.LastName = "DELETED"
		} else {
			group.Creator = *creator
		}

		groups = append(groups, group)
	}

	return &groups, nil
}

func (d *Database) UpdateGroup(group *models.Group) error {
	fmt.Println(group)
	query := `UPDATE groups SET name = ?, description = ?, creator_id = ?, image = ? WHERE id = ?`
	_, err := d.db.Exec(query, group.Name, group.Description, group.Creator.ID, group.Image, group.ID)
	if err != nil {
		fmt.Println("UpdateGroup", err)
		return err
	}
	return nil
}

func (d *Database) DeleteGroup(id int) error {
	query := `DELETE FROM groups WHERE id = ?`
	_, err := d.db.Exec(query, id)
	if err != nil {
		fmt.Println("DeleteGroup", err)
		return err
	}
	return nil
}

func (d *Database) GetGroupsByUserID(id int) (*[]models.Group, error) {
	var groups []models.Group
	query := `SELECT g.id, g.name, g.description, g.image 
	FROM groups AS g
	JOIN group_members AS gm ON gm.group_id = g.id
	WHERE gm.member_id = ? AND gm.approval_status = 'approved'

	ORDER BY g.id DESC`

	rows, err := d.db.Query(query, id)
	if err != nil {
		fmt.Println("GetGroupsByUserID (err in the query)", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var group models.Group
		err := rows.Scan(&group.ID, &group.Name, &group.Description, &group.Image)
		if err != nil {
			fmt.Println("GetGroupsByUserID (err in rows)", err)
			return nil, err
		}

		creator, err := d.GetUserByID(id)
		group.Creator = *creator

		groups = append(groups, group)
	}

	return &groups, nil
}
