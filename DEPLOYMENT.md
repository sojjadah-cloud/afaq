# 🚀 AFAQ Innovation Deployment Guide

## Quick Start Deployment (Estimated time: 30 minutes)

Follow these steps to deploy your AFAQ Innovation platform to production.

---

## Step 1: Database Setup

### Choose Your Database Provider

**🏆 Recommended: Railway** (MySQL - Easiest migration)
- Free trial: $5 credit (lasts months)
- MySQL compatible (no schema changes)
- Simple setup

**Alternative: Neon** (Postgres - Best long-term free tier)
- Truly free: 3GB storage, 0.5GB RAM
- Requires MySQL→Postgres conversion
- Unlimited projects

---

### Option A: Railway (Recommended)

#### 1.1 Create Railway Account
1. Visit https://railway.app
2. Sign up with GitHub
3. No credit card required for trial

#### 1.2 Create MySQL Database
1. Click "New Project"
2. Click "Add MySQL"
3. Database will be provisioned automatically

#### 1.3 Get Connection String
1. Click on your MySQL service
2. Go to "Variables" tab
3. Copy `DATABASE_URL` (looks like: `mysql://root:password@containers-us-west-xxx.railway.app:7032/railway`)

#### 1.4 Import Your Data
```bash
# Export your local database
mysqldump -u root afaq_innovation > backup.sql

# Option 1: Using Railway CLI (Recommended)
railway login
railway link
railway run mysql -u root -p railway < backup.sql

# Option 2: Using MySQL client directly
mysql -h containers-us-west-xxx.railway.app -P PORT -u root -p railway < backup.sql
```

---

### Option B: Neon (PostgreSQL)

#### 1.1 Create Neon Account
1. Visit https://neon.tech
2. Sign up (completely free, no credit card)

#### 1.2 Create Database
1. Create new project
2. Name: "afaq-innovation"
3. Copy connection string

#### 1.3 Convert Schema
**Note**: MySQL → Postgres requires schema adjustments:
- `AUTO_INCREMENT` → `SERIAL`
- `DATETIME` → `TIMESTAMP`
- Backticks → Double quotes
- (I can help with conversion if needed)

---

## Step 2: Vercel Setup

### 2.1 Create Vercel Account
1. Visit https://vercel.com
2. Sign up with GitHub (recommended)

### 2.2 Push Your Code to GitHub
```bash
cd "c:\Users\OMXQN\Desktop\afaq innovation\afaq-innovation-nextjs"
git init
git add .
git commit -m "Initial commit - Ready for deployment"
# Create repo on GitHub, then:
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2.3 Import Project to Vercel
1. In Vercel dashboard, click "Add New" → "Project"
2. Import your GitHub repository
3. Framework Preset: Next.js (auto-detected)
4. Click "Deploy" (it will fail first time - that's OK!)

---

## Step 3: Configure Environment Variables

### 3.1 Generate Session Secret
Run this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output - you'll need it next.

### 3.2 Add Variables to Vercel
1. Go to your project in Vercel
2. Click "Settings" → "Environment Variables"
3. Add these three variables (one by one):

**DATABASE_URL**
- **For Railway**: Copy from Railway dashboard Variables tab
  ```
  mysql://root:PASSWORD@containers-us-west-xxx.railway.app:PORT/railway
  ```
- **For Neon**: Copy from Neon dashboard
  ```
  postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
  ```
- Environment: Production ✅

**SESSION_SECRET**
- Value: The random string from Step 3.1
- Environment: Production ✅

**NEXT_PUBLIC_APP_URL**
- Value: Your Vercel URL (e.g., `https://afaq-innovation.vercel.app`)
- Or your custom domain if you have one
- Environment: Production ✅

---

## Step 4: Deploy

### 4.1 Trigger Deployment
1. Go to "Deployments" tab
2. Click the three dots (⋮) on the failed deployment
3. Click "Redeploy"
4. Wait 2-3 minutes for build to complete

### 4.2 Verify Deployment
1. Click "Visit" when build completes
2. Your app should load!

---

## Step 5: Post-Deployment Testing

### 5.1 Test Core Features
- [ ] Home page loads
- [ ] Login page accessible
- [ ] Register new account
- [ ] Login with account
- [ ] Create a project
- [ ] View events
- [ ] Browse equipment

### 5.2 Check Database Connection
- [ ] User registration creates database entry
- [ ] Login authenticates from database
- [ ] Projects are saved to database

---

## Troubleshooting

### Database Connection Errors
**Error**: `Error: connect ETIMEDOUT`
- **Fix**: Check DATABASE_URL is correct in Vercel env variables
- Make sure it includes `?sslaccept=strict`

### Build Errors
**Error**: `DATABASE_URL not defined`
- **Fix**: Add environment variables in Vercel (Step 3.2)
- Redeploy after adding variables

### 500 Server Error on Pages
- **Fix**: Check Vercel Function Logs
- Go to Deployment → Functions → View logs
- Look for specific error messages

---

## Optional Enhancements

### Custom Domain
1. Go to project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration steps

### File Upload (Cloudinary)
1. Create free Cloudinary account: https://cloudinary.com
2. Add env variable: `CLOUDINARY_URL=cloudinary://...`
3. Update file upload code to use Cloudinary

---

## Important Notes

⚠️ **File Uploads**: Currently disabled for deployment. Files will be stored in Vercel's temporary filesystem and lost on redeploy. Add Cloudinary/S3 for persistent storage.

⚠️ **Database Limits**: PlanetScale free tier includes:
- 5GB storage
- 1 billion row reads/month
- Sufficient for ~1000 active users

⚠️ **Deployment URL**: Your app will be at `https://afaq-innovation.vercel.app` (or custom domain)

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **PlanetScale Docs**: https://planetscale.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

## Checklist

- [ ] PlanetScale database created
- [ ] Database schema imported
- [ ] GitHub repository created and pushed
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Deployment successful
- [ ] Website accessible at Vercel URL
- [ ] Login/Registration works
- [ ] Database operations confirmed

---

**🎉 Congratulations!** Your AFAQ Innovation platform is now live!
