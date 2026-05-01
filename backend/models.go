package main

import "time"

// User represents the database record
type User struct {
	ID        int64  `db:"id" json:"id"`
	FirstName string `db:"first_name" json:"first_name"`
	LastName  string `db:"last_name" json:"last_name"`
	Email     string `db:"email" json:"email"`
	Country   string `db:"country" json:"country"`
	Age       int    `db:"age" json:"age"`
	Status    string `db:"status" json:"status"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

// ExportRequest represents the export request from frontend
type ExportRequest struct {
	Filters   FilterCriteria `json:"filters"`
	Format    string         `json:"format"` // csv, json
	ChunkSize int            `json:"chunk_size"` // optional, defaults to 10000
}

// FilterCriteria represents the filter parameters
type FilterCriteria struct {
	Country   *string `json:"country"`
	AgeMin    *int    `json:"age_min"`
	AgeMax    *int    `json:"age_max"`
	Status    *string `json:"status"`
	SearchTerm *string `json:"search_term"`
}

// ExportSession tracks export progress for resume capability
type ExportSession struct {
	ID              string                 `json:"id"`
	StartedAt       time.Time              `json:"started_at"`
	LastUpdatedAt   time.Time              `json:"last_updated_at"`
	TotalRecords    int64                  `json:"total_records"`
	ProcessedRecords int64                 `json:"processed_records"`
	Status          string                 `json:"status"` // pending, processing, completed, failed
	FilePath        string                 `json:"file_path"`
	Filters         FilterCriteria         `json:"filters"`
	ErrorMessage    string                 `json:"error_message,omitempty"`
	ExpiresAt       time.Time              `json:"expires_at"`
}

// PaginationParams for API responses
type PaginationParams struct {
	Page     int `json:"page"`
	PageSize int `json:"page_size"`
	Total    int64 `json:"total"`
}

// ListResponse wraps the user list response
type ListResponse struct {
	Data       []User             `json:"data"`
	Pagination PaginationParams   `json:"pagination"`
}

// ExportResponse for export initiation
type ExportResponse struct {
	SessionID string    `json:"session_id"`
	Status    string    `json:"status"`
	Message   string    `json:"message"`
	ExpiresAt time.Time `json:"expires_at"`
}

// ExportStatusResponse for checking export status
type ExportStatusResponse struct {
	SessionID        string `json:"session_id"`
	Status           string `json:"status"`
	ProcessedRecords int64  `json:"processed_records"`
	TotalRecords     int64  `json:"total_records"`
	DownloadURL      string `json:"download_url,omitempty"`
	ErrorMessage     string `json:"error_message,omitempty"`
	Progress         float64 `json:"progress"`
}

// ErrorResponse for API errors
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
	Code    int    `json:"code"`
}
