# Deployment Guide - Free Tier (Supabase + Railway/Render)

## 🎯 Goal
Deploy a complete data export system using FREE services:
- **Database**: Supabase (PostgreSQL - 500MB free)
- **Backend**: Railway or Render (free tier)
- **Frontend**: Vercel (free tier)

---

## 📊 Cost Analysis
- **Supabase**: FREE (500MB storage)
- **Railway**: FREE ($5/month credit)
- **Vercel**: FREE
- **Total Monthly Cost**: $0

---

## Step 1: Supabase Setup (5 minutes)

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Click "Sign up" → Create account
3. Click "New Project"
4. Fill form:
   - Organization: Create new
   - Project name: `data-export`
   - Database password: `SuperSecure123!` (save this!)
   - Region: Choose closest to you
   - Pricing plan: "Free"

### 1.2 Get Connection String
1. Wait for project to initialize (~2 min)
2. Go to Settings → Database → Connection String
3. Copy the PostgreSQL connection string:
   ```
   postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
   ```
4. Replace `PASSWORD` with your database password

### 1.3 Create Database Schema
1. Go to SQL Editor
2. Create new query (click "+")
3. Copy entire content from `backend/schema.sql`
4. Paste into editor
5. Click "Run"
6. Wait for indexes to be created

**Connection String Example:**
```
postgresql://postgres:SuperSecure123!@db.abcdefgh.supabase.co:5432/postgres
```

---

## Step 2: Backend Deployment (Railway)

### 2.1 Prepare Code for Deployment
```bash
cd backend

# Create .env.production
echo "DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres" > .env.production
echo "PORT=8080" >> .env.production
echo "EXPORT_DIR=./exports" >> .env.production
```

### 2.2 Push to GitHub
```bash
# Initialize git repo
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub
# Push code
git remote add origin https://github.com/YOUR_USERNAME/data-export-system.git
git branch -M main
git push -u origin main
```

### 2.3 Deploy to Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `data-export-system` repo
5. Select `backend` folder
6. Railway auto-detects Go
7. Click "Deploy"

### 2.4 Configure Environment Variables
1. Go to Variables tab
2. Add:
   - `DATABASE_URL`: Your Supabase connection string
   - `PORT`: `8080`
   - `EXPORT_DIR`: `./exports`
3. Click "Save"
4. Wait for deployment to complete

### 2.5 Get Backend URL
1. Go to Deployments tab
2. Click the live deployment
3. Copy domain: `https://data-export-backend-xxxx.railway.app`
4. Test: Open in browser or `curl https://data-export-backend-xxxx.railway.app/health`

---

## Step 3: Frontend Deployment (Vercel)

### 3.1 Update API URL
```bash
cd frontend

# Update .env.local with backend URL
echo "NEXT_PUBLIC_API_URL=https://data-export-backend-xxxx.railway.app" > .env.local
```

### 3.2 Push to GitHub
```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

### 3.3 Deploy to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Select your repo
5. Configure:
   - Framework: "Next.js"
   - Root directory: `frontend`
   - Environment variables:
     ```
     NEXT_PUBLIC_API_URL=https://data-export-backend-xxxx.railway.app
     ```
6. Click "Deploy"

### 3.4 Get Frontend URL
- Vercel shows URL: `https://data-export-xxx.vercel.app`
- Open in browser to test

---

## Step 4: Verification

### Test Backend
```bash
# Health check
curl https://data-export-backend-xxxx.railway.app/health
# Should return: OK

# List users
curl "https://data-export-backend-xxxx.railway.app/api/users?page=1&page_size=10"
# Should return: User data with pagination
```

### Test Frontend
1. Open https://data-export-xxx.vercel.app
2. Should see:
   - Filter panel
   - Data table with users
   - Export button
3. Try filtering and exporting

---

## 🚨 Common Issues & Fixes

### Issue: "Connection refused" for database
**Cause**: Supabase IP not in connection pool
**Fix**:
1. Go to Supabase Dashboard
2. Settings → Database → Connection String
3. Copy the correct string with PASSWORD

### Issue: Frontend shows "Failed to fetch"
**Cause**: API URL incorrect
**Fix**:
1. Check Vercel environment variables
2. Verify backend URL is correct
3. Check CORS in backend is enabled

### Issue: Export button not responding
**Cause**: Backend not running or database connection failed
**Fix**:
1. Check Railway deployment status
2. Check environment variables in Railway
3. Test backend health endpoint

### Issue: Supabase says "Connection limit exceeded"
**Cause**: Free tier only allows 4 connections
**Fix**:
1. Reduce connection pool: `db.SetMaxOpenConns(4)`
2. Use connection pooler: Add `?sslmode=require` to connection string
3. Upgrade to Pro plan

---

## 📈 Monitoring & Maintenance

### Monitor Backend (Railway)
- Go to Deployments → Logs
- Check for errors
- Monitor CPU/Memory usage

### Monitor Database (Supabase)
- Dashboard → Analytics
- Check storage usage
- Monitor query performance

### Monitor Frontend (Vercel)
- Dashboard → Deployments → Analytics
- Check performance metrics
- Monitor build logs

---

## 🔄 Continuous Deployment

### Enable Auto-Deploy
1. **Railway**: Enabled by default from Git
2. **Vercel**: Enabled by default from Git

When you `git push`:
1. Railway auto-deploys backend
2. Vercel auto-deploys frontend

---

## 📋 Production Checklist

- [ ] Database schema initialized
- [ ] Backend environment variables set
- [ ] Frontend API URL configured
- [ ] CORS properly configured
- [ ] Exports directory configured
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Health check endpoint working
- [ ] Sample export tested
- [ ] Download verified

---

## 🎉 You're Live!

Your free production deployment is ready:
- Frontend: https://data-export-xxx.vercel.app
- Backend: https://data-export-backend-xxxx.railway.app
- Database: Supabase PostgreSQL

**Total cost**: $0/month 🎊

---

## 📞 Support

For issues:
1. Check Railway logs
2. Check Vercel logs
3. Check Supabase SQL Editor for database issues
4. Review the main README.md troubleshooting section
