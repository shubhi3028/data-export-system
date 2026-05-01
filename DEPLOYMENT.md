# Deployment Guide

This application can be deployed to free platforms: Supabase + Railway + Vercel

## Prerequisites
- Supabase account (https://supabase.com) - Free tier
- Railway account (https://railway.app) - Free tier  
- Vercel account (https://vercel.com) - Free tier
- Git repository (GitHub, GitLab, etc.)

## Step 1: Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. In SQL Editor, run the contents of `backend/schema.sql` to create tables and indexes
4. Copy the connection string from Project Settings → Database → Connection Pooling
   - Format: `postgres://user:password@host:port/database?sslmode=require`
5. Keep this DATABASE_URL safe - you'll need it for the backend

## Step 2: Backend Deployment (Railway)

1. Go to [railway.app](https://railway.app) and create an account
2. Create a new project
3. Select "Deploy from GitHub" (or upload files)
4. Connect your repository
5. Railway should auto-detect it's a Go project
6. Set environment variables in Railway dashboard:
   ```
   DATABASE_URL=<your_supabase_connection_string>
   ```
7. Deploy - Railway will build and start the app
8. Copy your Railway backend URL (e.g., `https://your-project.railway.app`)

## Step 3: Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com) and create an account
2. Create a new project
3. Select "Import Git Repository"
4. Select your repository
5. In Environment Variables, add:
   ```
   NEXT_PUBLIC_API_URL=<your_railway_backend_url>
   ```
6. Deploy - Vercel handles building Next.js automatically
7. Your app is now live!

## API Endpoints

Your deployed backend will have these endpoints:

```
GET    /health                  - Health check
GET    /api/users?page=1&limit=10 - List users with pagination
POST   /api/export/initiate     - Start CSV export
GET    /api/export/status/:id   - Check export status
GET    /api/export/download/:id - Download CSV file
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgres://user:password@host:port/db?sslmode=require
PORT=8080
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

## Troubleshooting

### Backend fails to start
- Check DATABASE_URL format is correct
- Verify Supabase project is active
- Check Railway logs for connection errors

### Frontend can't reach backend
- Ensure NEXT_PUBLIC_API_URL is set correctly
- Check CORS is enabled in backend (it is by default)
- Verify Railway backend is running

### Database connection timeout
- Increase connection pool size in Railway dashboard
- Verify Supabase firewall allows Railway IP (usually allows all)

## Scaling

All three platforms offer easy scaling:
- **Supabase**: Auto-scales (check pricing for usage)
- **Railway**: Pay-as-you-go, scales automatically
- **Vercel**: Auto-scales, serverless

For large exports (1M+ records), monitor your backend memory usage in Railway dashboard.
