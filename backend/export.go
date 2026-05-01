package main

import (
	"encoding/csv"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"sync"
	"time"
)

var (
	exportSessions = make(map[string]*ExportSession)
	sessionMutex   sync.RWMutex
)

// InitExportSession creates a new export session
func InitExportSession(filters FilterCriteria) (*ExportSession, error) {
	// Get total count first to know how many records to export
	totalCount, err := GetTotalCount(filters)
	if err != nil {
		return nil, err
	}

	sessionID := generateSessionID()
	session := &ExportSession{
		ID:            sessionID,
		StartedAt:     time.Now(),
		LastUpdatedAt: time.Now(),
		TotalRecords:  totalCount,
		Status:        "processing",
		Filters:       filters,
		ExpiresAt:     time.Now().Add(24 * time.Hour),
	}

	sessionMutex.Lock()
	exportSessions[sessionID] = session
	sessionMutex.Unlock()

	return session, nil
}

// GetExportSession retrieves an export session
func GetExportSession(sessionID string) (*ExportSession, error) {
	sessionMutex.RLock()
	defer sessionMutex.RUnlock()

	session, ok := exportSessions[sessionID]
	if !ok {
		return nil, fmt.Errorf("session not found")
	}

	// Check if session has expired
	if time.Now().After(session.ExpiresAt) {
		return nil, fmt.Errorf("session expired")
	}

	return session, nil
}

// UpdateSessionProgress updates the progress of an export session
func UpdateSessionProgress(sessionID string, processedRecords int64) error {
	sessionMutex.Lock()
	defer sessionMutex.Unlock()

	session, ok := exportSessions[sessionID]
	if !ok {
		return fmt.Errorf("session not found")
	}

	session.ProcessedRecords = processedRecords
	session.LastUpdatedAt = time.Now()
	return nil
}

// CompleteExportSession marks an export session as complete
func CompleteExportSession(sessionID, filePath string) error {
	sessionMutex.Lock()
	defer sessionMutex.Unlock()

	session, ok := exportSessions[sessionID]
	if !ok {
		return fmt.Errorf("session not found")
	}

	session.Status = "completed"
	session.FilePath = filePath
	session.LastUpdatedAt = time.Now()
	return nil
}

// FailExportSession marks an export session as failed
func FailExportSession(sessionID, errorMsg string) error {
	sessionMutex.Lock()
	defer sessionMutex.Unlock()

	session, ok := exportSessions[sessionID]
	if !ok {
		return fmt.Errorf("session not found")
	}

	session.Status = "failed"
	session.ErrorMessage = errorMsg
	session.LastUpdatedAt = time.Now()
	return nil
}

// StreamToCSV streams data to CSV file with resume capability
func StreamToCSV(sessionID string, exportDir string) error {
	// Get session
	sessionMutex.RLock()
	session, ok := exportSessions[sessionID]
	sessionMutex.RUnlock()
	if !ok {
		return fmt.Errorf("session not found")
	}

	// Ensure export directory exists
	if err := os.MkdirAll(exportDir, 0755); err != nil {
		return fmt.Errorf("failed to create export directory: %w", err)
	}

	filePath := filepath.Join(exportDir, fmt.Sprintf("export_%s.csv", sessionID))
	chunkSize := 10000 // Process 10k records at a time

	// Determine start offset (for resume capability)
	startOffset := int64(0)
	if _, err := os.Stat(filePath); err == nil {
		// File exists, count lines to resume from last position
		existingCount, err := countCSVLines(filePath)
		if err == nil && existingCount > 0 {
			startOffset = int64(existingCount)
		}
	}

	// Open or create CSV file
	file, err := os.OpenFile(filePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		FailExportSession(sessionID, err.Error())
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	// Write header if file is empty
	info, _ := file.Stat()
	if info.Size() == 0 {
		header := []string{"ID", "FirstName", "LastName", "Email", "Country", "Age", "Status", "CreatedAt"}
		if err := writer.Write(header); err != nil {
			FailExportSession(sessionID, err.Error())
			return fmt.Errorf("failed to write header: %w", err)
		}
	}

	// Stream data in chunks
	currentOffset := startOffset
	for currentOffset < session.TotalRecords {
		users, err := GetUsersStream(session.Filters, chunkSize, currentOffset)
		if err != nil {
			FailExportSession(sessionID, err.Error())
			return fmt.Errorf("failed to fetch users: %w", err)
		}

		if len(users) == 0 {
			break
		}

		// Write records to CSV
		for _, user := range users {
			record := []string{
				strconv.FormatInt(user.ID, 10),
				user.FirstName,
				user.LastName,
				user.Email,
				user.Country,
				strconv.Itoa(user.Age),
				user.Status,
				user.CreatedAt.Format(time.RFC3339),
			}
			if err := writer.Write(record); err != nil {
				FailExportSession(sessionID, err.Error())
				return fmt.Errorf("failed to write record: %w", err)
			}
		}

		// Flush periodically
		writer.Flush()

		// Update progress
		currentOffset += int64(len(users))
		UpdateSessionProgress(sessionID, currentOffset)

		// Log progress (for monitoring)
		fmt.Printf("Progress: %d/%d records processed\n", currentOffset, session.TotalRecords)
	}

	// Mark as completed
	CompleteExportSession(sessionID, filePath)
	fmt.Printf("Export completed. File saved to: %s\n", filePath)

	return nil
}

// countCSVLines counts the number of lines in a CSV file (excluding header)
func countCSVLines(filePath string) (int, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return 0, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	lineCount := 0

	for {
		_, err := reader.Read()
		if err != nil {
			break
		}
		lineCount++
	}

	// Subtract 1 for header
	if lineCount > 0 {
		lineCount--
	}

	return lineCount, nil
}

// generateSessionID generates a unique session ID
func generateSessionID() string {
	return fmt.Sprintf("export_%d", time.Now().UnixNano())
}

// CleanupExpiredSessions removes expired sessions
func CleanupExpiredSessions() {
	sessionMutex.Lock()
	defer sessionMutex.Unlock()

	now := time.Now()
	for id, session := range exportSessions {
		if now.After(session.ExpiresAt) {
			delete(exportSessions, id)
			// Optionally delete the file
			if session.FilePath != "" {
				os.Remove(session.FilePath)
			}
		}
	}
}
