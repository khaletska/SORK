package sqlite

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
	migrate "github.com/rubenv/sql-migrate"
)

// those two functions are an exaple how to work with creted migrations
func createAllTables() {
	// read migrations from a folder:
	migrations := &migrate.FileMigrationSource{
		Dir: "db/migrations",
	}

	db, err := sql.Open("sqlite3", "db/database.db")
	if err != nil {
		// Handle errors!
		fmt.Println("err1: ", err)
	}

	_, err = migrate.Exec(db, "sqlite3", migrations, migrate.Up) // to create all tables
	if err != nil {
		// Handle errors!
		fmt.Println("err2: ", err)
	}
}

func dropAllTables() {
	// read migrations from a folder:
	migrations := &migrate.FileMigrationSource{
		Dir: "db/migrations",
	}

	db, err := sql.Open("sqlite3", "db/database.db")
	if err != nil {
		// Handle errors!
		fmt.Println("err1: ", err)
	}

	n, err := migrate.Exec(db, "sqlite3", migrations, migrate.Down) //  to drop all tables
	if err != nil {
		// Handle errors!
		fmt.Println("err2: ", err)
	}
	fmt.Printf("Applied %d migrations!\n", n)
}
