package main

import (
	"database/sql"
	"fmt"
	"strings"

	_ "github.com/lib/pq"
)

var db *sql.DB

// InitDB initializes the database connection
func InitDB(dbURL string) error {
	var err error
	db, err = sql.Open("postgres", dbURL)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Test connection
	err = db.Ping()
	if err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	return nil
}

// BuildFilterQuery constructs SQL WHERE clause based on filters
func BuildFilterQuery(filters FilterCriteria) (string, []interface{}) {
	var conditions []string
	var args []interface{}
	argCount := 1

	if filters.Country != nil && *filters.Country != "" {
		conditions = append(conditions, fmt.Sprintf("country = $%d", argCount))
		args = append(args, *filters.Country)
		argCount++
	}

	if filters.Status != nil && *filters.Status != "" {
		conditions = append(conditions, fmt.Sprintf("status = $%d", argCount))
		args = append(args, *filters.Status)
		argCount++
	}

	if filters.AgeMin != nil {
		conditions = append(conditions, fmt.Sprintf("age >= $%d", argCount))
		args = append(args, *filters.AgeMin)
		argCount++
	}

	if filters.AgeMax != nil {
		conditions = append(conditions, fmt.Sprintf("age <= $%d", argCount))
		args = append(args, *filters.AgeMax)
		argCount++
	}

	if filters.SearchTerm != nil && *filters.SearchTerm != "" {
		searchTerm := fmt.Sprintf("%%%s%%", *filters.SearchTerm)
		conditions = append(conditions, fmt.Sprintf("(first_name ILIKE $%d OR last_name ILIKE $%d OR email ILIKE $%d)", argCount, argCount+1, argCount+2))
		args = append(args, searchTerm, searchTerm, searchTerm)
		argCount += 3
	}

	where := ""
	if len(conditions) > 0 {
		where = "WHERE " + strings.Join(conditions, " AND ")
	}

	return where, args
}

// GetTotalCount returns total record count for given filters
func GetTotalCount(filters FilterCriteria) (int64, error) {
	whereClause, args := BuildFilterQuery(filters)
	query := fmt.Sprintf("SELECT COUNT(*) FROM users %s", whereClause)

	var count int64
	err := db.QueryRow(query, args...).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get count: %w", err)
	}

	return count, nil
}

// GetUsersPaginated fetches users with pagination
func GetUsersPaginated(filters FilterCriteria, page, pageSize int) ([]User, error) {
	whereClause, args := BuildFilterQuery(filters)
	offset := (page - 1) * pageSize

	// Add offset and limit parameters
	query := fmt.Sprintf(
		"SELECT id, first_name, last_name, email, country, age, status, created_at FROM users %s ORDER BY id ASC LIMIT %d OFFSET %d",
		whereClause,
		pageSize,
		offset,
	)

	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var u User
		err := rows.Scan(&u.ID, &u.FirstName, &u.LastName, &u.Email, &u.Country, &u.Age, &u.Status, &u.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}
		users = append(users, u)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return users, nil
}

// GetUsersStream fetches users in chunks for streaming (with offset for resume capability)
func GetUsersStream(filters FilterCriteria, chunkSize int, offset int64) ([]User, error) {
	whereClause, args := BuildFilterQuery(filters)

	query := fmt.Sprintf(
		"SELECT id, first_name, last_name, email, country, age, status, created_at FROM users %s ORDER BY id ASC LIMIT %d OFFSET %d",
		whereClause,
		chunkSize,
		offset,
	)

	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var u User
		err := rows.Scan(&u.ID, &u.FirstName, &u.LastName, &u.Email, &u.Country, &u.Age, &u.Status, &u.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}
		users = append(users, u)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return users, nil
}

// CloseDB closes the database connection
func CloseDB() error {
	if db != nil {
		return db.Close()
	}
	return nil
}
