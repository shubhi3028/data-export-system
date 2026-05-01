# Technical Specifications & Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA EXPORT SYSTEM ARCHITECTURE             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  FRONTEND (NextJS)          BACKEND (Go)        DATABASE         │
│  ┌──────────────────┐       ┌─────────────┐     ┌────────────┐  │
│  │ React Components │       │ API Server  │     │ PostgreSQL │  │
│  │ - Dashboard      ├──────→│ - Handlers  ├────→│ - Users    │  │
│  │ - DataTable      │ HTTP  │ - Export    │ SQL │ - Indexes  │  │
│  │ - Filters        │       │ - Sessions  │     │            │  │
│  │ - ExportDialog   │       │ - DB Ops    │     │ (Supabase) │  │
│  └──────────────────┘       └─────────────┘     └────────────┘  │
│          │                        │                    │          │
│          └────────────────────────┴────────────────────┘          │
│                   Streaming CSV Export                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Language**: Go 1.21+
- **Framework**: Gorilla Mux (router)
- **Database Driver**: lib/pq (PostgreSQL)
- **CORS**: rs/cors
- **Server**: HTTP/1.1 with TLS support

### Frontend
- **Framework**: Next.js 14.0
- **Runtime**: React 18.2
- **HTTP Client**: Axios 1.6
- **CSS**: CSS Modules
- **Node**: 18+

### Database
- **Engine**: PostgreSQL 15
- **Service**: Supabase (managed)
- **Connection**: 25 max open, 5 idle
- **Storage**: 500MB free tier

---

## API Specifications

### Base URL
- Local: `http://localhost:8080`
- Production: `https://api.yourdomain.com`

### Response Format
All responses are JSON with consistent error handling.

#### Success Response (200)
```json
{
  "data": [...],
  "pagination": {...}
}
```

#### Error Response (4xx, 5xx)
```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "code": 400
}
```

### Endpoints

#### GET /health
- **Purpose**: Health check
- **Response**: 200 OK, "OK"
- **Use Case**: Load balancer checks, monitoring

#### GET /api/users
- **Purpose**: List users with filtering and pagination
- **Query Params**:
  - `page` (int, default: 1)
  - `page_size` (int, default: 1000, max: 1000)
  - `country` (string, optional)
  - `status` (string, optional)
  - `age_min` (int, optional)
  - `age_max` (int, optional)
  - `search` (string, optional)
- **Response**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "country": "USA",
        "age": 30,
        "status": "Active",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 1000,
      "total": 1000000
    }
  }
  ```

#### POST /api/export/initiate
- **Purpose**: Start a new export session
- **Body**:
  ```json
  {
    "filters": {
      "country": "USA",
      "status": "Active",
      "age_min": 25,
      "age_max": 60,
      "search": null
    },
    "format": "csv",
    "chunk_size": 10000
  }
  ```
- **Response**: 202 Accepted
  ```json
  {
    "session_id": "export_1714521600000",
    "status": "processing",
    "message": "Export started. Total records to export: 50000",
    "expires_at": "2024-05-02T10:15:33Z"
  }
  ```
- **Status Code**: 202 (Accepted - processing)

#### GET /api/export/status
- **Purpose**: Check export progress
- **Query Params**:
  - `session_id` (string, required)
- **Response**:
  ```json
  {
    "session_id": "export_1714521600000",
    "status": "processing",
    "processed_records": 25000,
    "total_records": 50000,
    "progress": 50.0,
    "download_url": "",
    "error_message": ""
  }
  ```
- **Status Values**: `pending`, `processing`, `completed`, `failed`

#### GET /api/export/download
- **Purpose**: Download completed export
- **Query Params**:
  - `session_id` (string, required)
- **Response**: CSV file stream
- **Headers**:
  ```
  Content-Type: text/csv
  Content-Disposition: attachment; filename=export_SESSION_ID.csv
  ```

---

## Database Schema

### Table: users
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    country VARCHAR(100),
    age INT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes
```sql
CREATE INDEX idx_users_country ON users(country);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_age ON users(age);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### Performance Characteristics
- **Table Scan**: All 1M records without filters: ~500ms
- **Indexed Query**: With country filter: ~50ms
- **Complex Filter**: Multiple conditions: ~100-200ms
- **Full Export**: 1M records: ~8 minutes

---

## Data Flow Diagrams

### Export Workflow
```
User Interface
    │
    ├─ 1. Applies Filters
    ├─ 2. Clicks "Export CSV"
    │
    ▼
Frontend (/api/export/initiate)
    │
    ├─ 3. POST with filters
    │
    ▼
Backend (Generate SessionID)
    │
    ├─ 4. Create export session
    ├─ 5. Count total records
    ├─ 6. Spawn goroutine for streaming
    │
    ▼
Response to Frontend (202 Accepted + SessionID)
    │
    ├─ 7. Frontend stores SessionID
    ├─ 8. Start polling /api/export/status
    │
    ▼
Backend (Streaming)
    │
    ├─ 9. Query 10K records at a time
    ├─ 10. Write to CSV file
    ├─ 11. Update session progress
    ├─ 12. Repeat until all records processed
    │
    ▼
Backend (Mark Complete)
    │
    ├─ 13. Session status = "completed"
    ├─ 14. Update session.file_path
    │
    ▼
Frontend Detects Completion
    │
    ├─ 15. Poll returns status="completed"
    ├─ 16. Show download link
    │
    ▼
User Downloads CSV
    │
    └─ 17. GET /api/export/download?session_id=...
        18. Backend serves file
        19. Browser downloads
```

### Resume Capability Flow
```
Export In Progress
    │
    ├─ 100K records processed
    ├─ CSV has 100K lines
    ├─ Session.ProcessedRecords = 100000
    │
    ▼
Network Error / Browser Close
    │
    └─ User clicks "Retry" or refreshes
        │
        ▼
    POST /api/export/initiate (same filters)
        │
        ├─ New SessionID generated
        ├─ Check if CSV exists
        ├─ Count existing lines: 100001 (header + 100K data)
        ├─ Subtract 1 for header = 100000
        ├─ Set startOffset = 100000
        │
        ▼
    Resume from offset 100000
        │
        ├─ Query: LIMIT 10000 OFFSET 100000
        ├─ Append to existing CSV (not recreate)
        ├─ Continue streaming
        │
        ▼
    Export Completes
        │
        └─ Full CSV file with all records
```

---

## Performance Optimizations

### 1. Query Optimization
- **Index Strategy**: Separate index for each frequently filtered column
- **Composite Index**: Consider for common filter combinations
- **Query Planning**: Use EXPLAIN ANALYZE for optimization

### 2. Connection Pooling
```go
db.SetMaxOpenConns(25)    // PostgreSQL default
db.SetMaxIdleConns(5)      // Keep 5 ready
// Timeout: 15 seconds default
```

### 3. Chunked Processing
- **Chunk Size**: 10,000 records per batch
- **Memory Usage**: ~15MB per chunk
- **Network**: Reduces JSON serialization overhead

### 4. CSV Streaming
- **Line Buffering**: csv.Writer buffers 64KB by default
- **Periodic Flush**: After each chunk
- **Append Mode**: Enables resume without reprocessing

### 5. Frontend Caching
- **Session Storage**: LocalStorage for SessionID
- **Debounced Filters**: 500ms delay on filter changes
- **Poll Interval**: 1 second (configurable)

---

## Error Handling Strategy

### Database Errors
```
Error Type          Action                          Retry?
──────────────────────────────────────────────────────────
Connection Failed   Log + Return 500                Yes
Query Timeout       Cancel + Return 504             Yes
Constraint Error    Return 400                      No
No Rows             Return 200 with empty data      No
```

### Export Errors
```
Error Type          Action                          Recovery
──────────────────────────────────────────────────────────
DB Query Failed     Mark session "failed"           Resume from offset
CSV Write Failed    Mark session "failed"           Retry same offset
Network Timeout     Auto-retry 3x                   Same
Session Expired     Return 410 Gone                 Start new export
```

### Frontend Error Handling
```javascript
// 1. Network error → Show retry button
// 2. Export failed → Show error message + retry
// 3. Download failed → Retry download
// 4. Invalid filters → Show validation error
```

---

## Security Considerations

### Input Validation
- All query params validated against schema
- String params max length: 100
- Integer params range checked
- Special characters escaped

### SQL Injection Prevention
- All queries use parameterized statements
- No string concatenation in WHERE clauses
- Driver: lib/pq handles escaping

### Authentication (for production)
- Add JWT token verification
- Rate limiting per user
- IP whitelisting (optional)

### Data Protection
- Implement row-level security (RLS)
- Add encryption at rest
- Use HTTPS only
- Sanitize export filenames

---

## Scalability Strategy

### Horizontal Scaling
1. Multiple backend instances (load balancer)
2. Shared session store (Redis)
3. Shared file storage (S3/CloudStorage)

### Vertical Scaling
1. Database read replicas for queries
2. Increase connection pool size
3. Increase chunk size (with caution)

### Caching Strategy
1. Cache total counts (5-minute TTL)
2. Cache filter options (static data)
3. Browser cache static assets

---

## Monitoring Metrics

### Backend
- Request latency (p50, p95, p99)
- Export duration distribution
- Database query times
- Active sessions count
- Error rate

### Database
- Connection pool utilization
- Query execution time
- Index usage
- Table scan rate
- Slow query log

### Frontend
- Page load time
- Export initiation latency
- Download speed
- Error rate

---

## Version History

| Version | Date       | Changes                          |
|---------|-------------|----------------------------------|
| 1.0     | 2024-05-01  | Initial release                  |
|         |             | - Basic export functionality      |
|         |             | - Pagination & filtering          |
|         |             | - Resume capability              |
|         |             | - Supabase integration           |

---

**Last Updated**: May 1, 2024
**Author**: Interview Solution
