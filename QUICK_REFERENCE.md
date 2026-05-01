# Quick Reference Guide

## 🚀 Get Started in 3 Commands

### Option 1: Using Docker (Easiest)
```bash
cd backend
docker-compose up
```
Then open:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Database: postgres://user:password@localhost:5432/export_db

### Option 2: Manual Setup (Local)

**Terminal 1 - Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env and set DATABASE_URL to your PostgreSQL
go mod download
psql -U postgres -h localhost -f schema.sql  # Run migrations
go run main.go
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:3000

---

## 🧪 Testing Checklist

### 1. Frontend Loads
- [ ] Open http://localhost:3000
- [ ] See filter panel, data table
- [ ] See "Export to CSV" button

### 2. Filtering Works
- [ ] Filter by country → Data updates
- [ ] Filter by status → Data updates
- [ ] Age range filtering → Data updates
- [ ] Search by name/email → Data updates
- [ ] Reset filters → Shows all data

### 3. Pagination Works
- [ ] Click "Next" → Page 2 loads
- [ ] Click "Previous" → Back to page 1
- [ ] Record count updates correctly
- [ ] Disabled states on first/last page

### 4. Export Works
- [ ] Click "Export CSV" button
- [ ] Dialog opens with progress bar
- [ ] Progress bar moves from 0% → 100%
- [ ] Progress shows record count
- [ ] Dialog shows "Download CSV File" button when complete

### 5. Download Works
- [ ] Click "Download CSV File"
- [ ] CSV file downloads to computer
- [ ] Open CSV in Excel/Sheets
- [ ] Verify data matches table display
- [ ] Check header row

### 6. Export with Filters
- [ ] Apply filter (e.g., USA, Active)
- [ ] Click Export
- [ ] Wait for completion
- [ ] Download CSV
- [ ] Verify only filtered records in file

### 7. Resume Capability
- [ ] Start export
- [ ] After 30 seconds, close browser/cancel
- [ ] Click Export again with same filters
- [ ] Export should resume/complete faster
- [ ] Final CSV should have all records

### 8. Error Handling
- [ ] Stop database → Export fails gracefully
- [ ] Check "Retry" button appears
- [ ] Restart database → Retry works
- [ ] Wrong API URL → Shows error message
- [ ] Invalid filter → Shows error

---

## 📊 Sample Data Queries

### Count Records
```bash
curl "http://localhost:8080/api/users?page=1&page_size=1"
# Check "pagination.total"
```

### Filter by Country
```bash
curl "http://localhost:8080/api/users?page=1&country=USA"
```

### Filter by Age Range
```bash
curl "http://localhost:8080/api/users?page=1&age_min=25&age_max=35"
```

### Search
```bash
curl "http://localhost:8080/api/users?page=1&search=john"
```

### Start Export
```bash
curl -X POST http://localhost:8080/api/export/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {"country": "USA"},
    "format": "csv"
  }'
# Returns: {"session_id": "export_XXXXX", ...}
```

### Check Status
```bash
curl "http://localhost:8080/api/export/status?session_id=export_XXXXX"
```

### Download File
```bash
curl "http://localhost:8080/api/export/download?session_id=export_XXXXX" > export.csv
```

---

## 🔍 Debugging Tips

### Check Backend Logs
```bash
# Watch logs in real-time
go run main.go 2>&1 | tee backend.log

# Search for errors
grep -i error backend.log

# Check database connection
curl http://localhost:8080/health
```

### Check Frontend Logs
```bash
# Open browser console: F12 → Console tab
# Look for error messages
# Check Network tab for API calls
```

### Database Debugging
```bash
# Connect to local database
psql -U user -h localhost -d export_db -W
# Password: password

# Check data
SELECT COUNT(*) FROM users;
SELECT * FROM users LIMIT 10;

# Check indexes
\d users

# Check slow queries
EXPLAIN ANALYZE SELECT * FROM users WHERE country = 'USA';
```

### Network Debugging
```bash
# Test API connectivity
curl -v http://localhost:8080/health

# Test CORS
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:8080/api/users

# Monitor requests
# Open DevTools (F12) → Network tab
# Filter by XHR/Fetch
```

---

## 📈 Performance Testing

### Test API Speed
```bash
# Single page load time
time curl "http://localhost:8080/api/users?page=1" > /dev/null

# Multiple concurrent requests
for i in {1..10}; do
  curl "http://localhost:8080/api/users?page=$i" &
done
wait

# Monitor memory/CPU
top -p $(pgrep -f "go run main.go")
```

### Test Export Speed
```bash
# Start export with 10K records
time curl -X POST http://localhost:8080/api/export/initiate \
  -H "Content-Type: application/json" \
  -d '{}'

# Monitor with: watch -n 1 'ls -lh ./exports/'
```

---

## 🐛 Common Issues & Quick Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Connection refused" | Backend not running | Start backend: `go run main.go` |
| "Database connection error" | DB not running | Start: `docker-compose up` or PostgreSQL |
| "Cannot GET /" | Frontend not running | Start frontend: `npm run dev` |
| "Failed to fetch users" | API URL wrong | Check `.env.local` in frontend |
| "CORS error" | CORS not enabled | Backend CORS middleware enabled? |
| "CSV download fails" | Export not complete | Check status first, wait for 100% |
| Slow export | Large dataset | Increase chunk_size in config |
| Out of memory | Too many concurrent exports | Reduce connection pool size |

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `backend/main.go` | Server entry point |
| `backend/handlers.go` | API endpoint handlers |
| `backend/export.go` | CSV export logic |
| `backend/database.go` | Database queries |
| `backend/schema.sql` | Database schema |
| `frontend/app/page.js` | Main page |
| `frontend/app/components/Dashboard.jsx` | Dashboard layout |
| `frontend/app/lib/api.js` | API calls |
| `README.md` | Full documentation |
| `DEPLOYMENT_GUIDE.md` | Deployment instructions |

---

## 🔗 Useful Links

- **Go Docs**: https://golang.org/doc/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **Railway**: https://docs.railway.app
- **Vercel**: https://vercel.com/docs

---

## 💡 Tips & Tricks

### Speed Up Local Development
```bash
# Skip node_modules install (use lock file)
npm ci  # Instead of npm install

# Go build cache
go build -v  # Uses cache automatically

# Hot reload
npm run dev  # Already has hot reload
go run main.go  # Run on file changes with: go install github.com/cosmtrek/air
```

### Database Performance
```sql
-- Add more indexes for custom filters
CREATE INDEX idx_users_status_country ON users(status, country);

-- Refresh statistics for query planner
ANALYZE users;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes;
```

### Monitor Progress
```bash
# Watch export directory
watch -n 1 'ls -lh ./exports/ | tail -5'

# Monitor database load
watch -n 1 'SELECT COUNT(*) FROM users;'  # In psql

# Watch active connections
watch -n 1 'SELECT count(*) FROM pg_stat_activity;'  # In psql
```

---

## 🎯 Next Steps

1. **Local Testing**: Run `docker-compose up` and test all features
2. **Code Review**: Read through `TECHNICAL_SPECS.md`
3. **Customize**: Add your own filters and business logic
4. **Deploy**: Follow `DEPLOYMENT_GUIDE.md` for production
5. **Monitor**: Set up logging and monitoring

---

**Happy Coding! 🎉**

Need help? Check the main README.md or DEPLOYMENT_GUIDE.md
