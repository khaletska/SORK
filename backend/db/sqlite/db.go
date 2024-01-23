package sqlite

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var DB *Database

type Database struct {
	db *sql.DB
}

func ConnectDatabase() {
	addr, err := sql.Open("sqlite3", "db/database.db")
	// dropAllTables()
	createAllTables()
	if err != nil {
		log.Fatalf("could not initialize database connection: %s", err)
	}

	DB = &Database{db: addr}
}

func (d *Database) Close() {
	d.db.Close()
}

func (d *Database) GetDB() *sql.DB {
	return d.db
}
