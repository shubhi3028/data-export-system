package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	// Load environment variables
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://user:password@localhost:5432/export_db?sslmode=disable"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Initialize database
	if err := InitDB(dbURL); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer CloseDB()

	// Initialize export directory
	exportDir := os.Getenv("EXPORT_DIR")
	if exportDir == "" {
		exportDir = "./exports"
	}
	os.MkdirAll(exportDir, 0755)

	// Setup router
	router := mux.NewRouter()

	// API Routes
	router.HandleFunc("/api/users", ListHandler).Methods("GET")
	router.HandleFunc("/api/export/initiate", InitiateExportHandler).Methods("POST")
	router.HandleFunc("/api/export/status", ExportStatusHandler).Methods("GET")
	router.HandleFunc("/api/export/download", DownloadExportHandler).Methods("GET")

	// Health check
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")

	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		ExposedHeaders:   []string{"Content-Length"},
		MaxAge:           300,
		AllowCredentials: true,
	})

	handler := c.Handler(router)

	// Cleanup goroutine
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		for range ticker.C {
			CleanupExpiredSessions()
		}
	}()

	// Start server
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	fmt.Printf("Server starting on port %s\n", port)
	fmt.Println("Available endpoints:")
	fmt.Println("  GET  /api/users - List users with pagination and filters")
	fmt.Println("  POST /api/export/initiate - Start an export")
	fmt.Println("  GET  /api/export/status - Check export status")
	fmt.Println("  GET  /api/export/download - Download exported file")
	fmt.Println("  GET  /health - Health check")

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
