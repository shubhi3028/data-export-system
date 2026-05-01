# 🚀 GETTING STARTED - 3 MINUTES

## Copy & Paste These Commands

### 1️⃣ Start Backend (Terminal 1)
```bash
cd data-export-system/backend
docker-compose up
```

**Wait 30 seconds** for the database to initialize.

You'll see:
```
✅ postgres_1 is ready to accept connections
✅ Starting api-server
✅ Server starting on port 8080
```

### 2️⃣ Open Frontend (Terminal 2 or Browser)

**Option A**: If you have Node.js installed
```bash
cd data-export-system/frontend
npm install
npm run dev
```

**Option B**: Frontend already runs in Docker
Just open: **http://localhost:3000**

### 3️⃣ Test It Works

You should see:
- ✅ Filter panel on left (Country, Status, Age, Search)
- ✅ Data table with users
- ✅ "Export to CSV" button
- ✅ Pagination (Next/Previous buttons)

---

## 🧪 Quick Test

1. **Click "Export CSV"** button
2. Wait for progress bar (should complete in 10-20 seconds)
3. Click **"Download CSV File"**
4. Open the CSV file in Excel/Sheets

**That's it!** ✅

---

## 🛑 If You Hit Issues

### "Connection refused" or "Cannot connect to database"
```bash
# Make sure Docker is running
docker --version

# Try again:
cd data-export-system/backend
docker-compose down  # Stop
docker-compose up    # Start fresh
```

### "Cannot GET /"
Frontend not running. Open http://localhost:3000 or run:
```bash
cd frontend && npm run dev
```

### "Failed to fetch users"
Backend not running. Check Terminal 1 - should show "Server starting on port 8080"

---

## 📖 What to Read Next

1. **Quick overview**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) (5 min)
2. **Full guide**: [README.md](README.md) (20 min)
3. **Deploy to cloud**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) (30 min)
4. **Technical details**: [TECHNICAL_SPECS.md](TECHNICAL_SPECS.md) (optional)

---

## 💡 Pro Tips

### Monitor the export
```bash
# In another terminal, watch the export directory
watch -n 1 'ls -lh data-export-system/backend/exports/'
```

### Check backend logs
Look at Terminal 1 - you'll see:
```
Progress: 100/1000 records processed
Export completed. File saved to: ./exports/export_XXXXX.csv
```

### Test API directly
```bash
# List users
curl http://localhost:8080/api/users?page=1

# Check health
curl http://localhost:8080/health
```

---

## 🎯 What This System Does

✅ Displays 1000+ records in a paginated table
✅ Filters by multiple criteria (country, status, age, search)
✅ Exports ALL matching records to CSV (not just current page!)
✅ Shows real-time progress (0-100%)
✅ Can resume if interrupted
✅ Downloads file automatically when done

---

## 🌍 Deploy to Free Cloud (Optional)

Skip this for now, but when ready:

1. Create Supabase project (https://supabase.com) - FREE
2. Deploy backend to Railway (https://railway.app) - FREE
3. Deploy frontend to Vercel (https://vercel.com) - FREE
4. See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for steps

**Cost**: $0/month 🎉

---

## 🔍 Key Files

| File | What It Does |
|------|-------------|
| `backend/main.go` | Starts the API server |
| `backend/export.go` | Handles CSV export |
| `backend/handlers.go` | API endpoints |
| `backend/database.go` | Database queries |
| `frontend/app/components/Dashboard.jsx` | Main UI |
| `frontend/app/lib/api.js` | API calls |

---

## 📞 Help

**Terminal command not recognized?**
- Make sure you're in the right directory
- `pwd` shows current directory
- `ls` shows files

**Docker not working?**
- Install Docker: https://docker.com/products/docker-desktop
- Start Docker Desktop app

**npm not found?**
- Install Node.js: https://nodejs.org/
- Restart terminal after install

---

## ✅ Checklist

- [ ] Docker is running
- [ ] Backend started (`docker-compose up`)
- [ ] Frontend open at http://localhost:3000
- [ ] Can see data table
- [ ] Can see export button
- [ ] Export completes
- [ ] CSV downloads

**All done?** Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) next! 🎉

---

**Happy exporting! 🚀**

Still having issues? Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for detailed troubleshooting.
