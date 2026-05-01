# Complete Deployment Guide - Step by Step

## Your Supabase Details

**Project Name:** data-export-system
**Database Host:** db.nerbzgljqqdxguepfpii.supabase.co
**Database Port:** 5432
**Database User:** postgres
**Database Name:** postgres

**Full Connection String:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.nerbzgljqqdxguepfpii.supabase.co:5432/postgres
```

---

## 🚂 STEP 1: Deploy Backend to Railway

### 1.1 Go to Railway
- Visit: https://railway.app
- Sign in with GitHub

### 1.2 Create New Project
- Click "New Project"
- Select "Deploy from GitHub"
- Choose your repository: `shubhi3028/data-export-system`
- Confirm the connection

### 1.3 Add Environment Variables
Once Railway detects your repo, go to the **Variables** tab and add:

```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.nerbzgljqqdxguepfpii.supabase.co:5432/postgres
```

**Replace [YOUR-PASSWORD] with your actual Supabase password!**

### 1.4 Deploy
- Railway will automatically detect it's a Go project
- It will build and start automatically
- Go to "Deployments" tab to see your backend URL
- **Copy this URL** - you'll need it for the frontend! (e.g., `https://data-export-api-xxx.railway.app`)

---

## 🚀 STEP 2: Deploy Frontend to Vercel

### 2.1 Go to Vercel
- Visit: https://vercel.com
- Sign in with GitHub

### 2.2 Import Project
- Click "Add New" → "Project"
- Select "Import Git Repository"
- Find and select: `data-export-system`

### 2.3 Add Environment Variable
Before deploying, add:

```
NEXT_PUBLIC_API_URL=https://[YOUR-RAILWAY-URL]
```

**Replace [YOUR-RAILWAY-URL] with the URL you copied from Railway!**
Example: `https://data-export-api-prod.railway.app`

### 2.4 Deploy
- Click "Deploy"
- Vercel will build Next.js automatically
- Wait for deployment to complete
- You'll get a URL like: `https://data-export-system.vercel.app`

---

## ✅ Your App is LIVE!

Visit your Vercel URL and:
1. ✅ See your data in the table
2. ✅ Apply filters
3. ✅ Click "Export to CSV" to test the complete flow
4. ✅ Download your CSV file

---

## 🆘 Troubleshooting

### Backend won't start on Railway
- Check DATABASE_URL is correct
- Make sure password is included
- Check Railway logs for errors

### Frontend shows blank page
- Check NEXT_PUBLIC_API_URL in Vercel environment variables
- Make sure Railway backend URL is correct
- Check browser console (F12) for CORS errors

### Export button doesn't work
- Verify Railway URL in Vercel environment
- Check Railway backend is running
- Check browser console for errors

---

## 📋 Quick Reference

| Platform | What to Do |
|----------|-----------|
| **Supabase** | Database is ready ✅ |
| **Railway** | Deploy backend, copy URL |
| **Vercel** | Deploy frontend, add Railway URL to env |

**You're almost there! Just follow the steps above and your app will be live! 🎉**
