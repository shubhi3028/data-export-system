package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
)

// ListHandler returns paginated users
func ListHandler(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	page := 1
	pageSize := 1000

	if p := r.URL.Query().Get("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}

	if ps := r.URL.Query().Get("page_size"); ps != "" {
		if parsed, err := strconv.Atoi(ps); err == nil && parsed > 0 && parsed <= 1000 {
			pageSize = parsed
		}
	}

	// Build filters
	filters := FilterCriteria{
		Country:    getStringParam(r, "country"),
		AgeMin:     getIntParam(r, "age_min"),
		AgeMax:     getIntParam(r, "age_max"),
		Status:     getStringParam(r, "status"),
		SearchTerm: getStringParam(r, "search"),
	}

	// Get total count
	totalCount, err := GetTotalCount(filters)
	if err != nil {
		sendError(w, http.StatusInternalServerError, "Database error", err.Error())
		return
	}

	// Get paginated data
	users, err := GetUsersPaginated(filters, page, pageSize)
	if err != nil {
		sendError(w, http.StatusInternalServerError, "Database error", err.Error())
		return
	}

	if users == nil {
		users = []User{}
	}

	response := ListResponse{
		Data: users,
		Pagination: PaginationParams{
			Page:     page,
			PageSize: pageSize,
			Total:    totalCount,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// InitiateExportHandler starts a new export process
func InitiateExportHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendError(w, http.StatusMethodNotAllowed, "Method not allowed", "")
		return
	}

	var req ExportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendError(w, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Initialize export session
	session, err := InitExportSession(req.Filters)
	if err != nil {
		sendError(w, http.StatusInternalServerError, "Failed to initiate export", err.Error())
		return
	}

	// Get export directory from config or default
	exportDir := os.Getenv("EXPORT_DIR")
	if exportDir == "" {
		exportDir = "./exports"
	}

	// Start export in a goroutine to avoid blocking
	go func() {
		if err := StreamToCSV(session.ID, exportDir); err != nil {
			fmt.Printf("Export error for session %s: %v\n", session.ID, err)
			FailExportSession(session.ID, err.Error())
		}
	}()

	response := ExportResponse{
		SessionID: session.ID,
		Status:    "processing",
		Message:   fmt.Sprintf("Export started. Total records to export: %d", session.TotalRecords),
		ExpiresAt: session.ExpiresAt,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(response)
}

// ExportStatusHandler checks the status of an export
func ExportStatusHandler(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("session_id")
	if sessionID == "" {
		sendError(w, http.StatusBadRequest, "Missing session_id parameter", "")
		return
	}

	session, err := GetExportSession(sessionID)
	if err != nil {
		sendError(w, http.StatusNotFound, "Session not found", err.Error())
		return
	}

	progress := 0.0
	if session.TotalRecords > 0 {
		progress = float64(session.ProcessedRecords) / float64(session.TotalRecords) * 100
	}

	downloadURL := ""
	if session.Status == "completed" {
		downloadURL = fmt.Sprintf("/api/export/download?session_id=%s", sessionID)
	}

	response := ExportStatusResponse{
		SessionID:        session.ID,
		Status:           session.Status,
		ProcessedRecords: session.ProcessedRecords,
		TotalRecords:     session.TotalRecords,
		DownloadURL:      downloadURL,
		ErrorMessage:     session.ErrorMessage,
		Progress:         progress,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// DownloadExportHandler serves the exported file
func DownloadExportHandler(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("session_id")
	if sessionID == "" {
		sendError(w, http.StatusBadRequest, "Missing session_id parameter", "")
		return
	}

	session, err := GetExportSession(sessionID)
	if err != nil {
		sendError(w, http.StatusNotFound, "Session not found", err.Error())
		return
	}

	if session.Status != "completed" {
		sendError(w, http.StatusBadRequest, "Export not completed", fmt.Sprintf("Current status: %s", session.Status))
		return
	}

	// Check if file exists
	if _, err := os.Stat(session.FilePath); err != nil {
		sendError(w, http.StatusNotFound, "Export file not found", "")
		return
	}

	// Serve the file
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filepath.Base(session.FilePath)))
	w.Header().Set("Content-Type", "text/csv")
	http.ServeFile(w, r, session.FilePath)
}

// Helper functions
func getStringParam(r *http.Request, key string) *string {
	val := r.URL.Query().Get(key)
	if val == "" {
		return nil
	}
	return &val
}

func getIntParam(r *http.Request, key string) *int {
	val := r.URL.Query().Get(key)
	if val == "" {
		return nil
	}
	if parsed, err := strconv.Atoi(val); err == nil {
		return &parsed
	}
	return nil
}

func sendError(w http.ResponseWriter, statusCode int, error, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	response := ErrorResponse{
		Error:   error,
		Message: message,
		Code:    statusCode,
	}
	json.NewEncoder(w).Encode(response)
}
