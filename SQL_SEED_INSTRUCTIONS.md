# Database Seeding with SQL (No Prisma Issues!)

## ✅ Simple 3-Step Process

### Step 1: Make sure database tables exist
```bash
npx prisma migrate dev --name init
```

### Step 2: Open phpMyAdmin
1. Go to `http://localhost/phpmyadmin`
2. Click on `afaq_innovation` database in left sidebar
3. Click on **"SQL"** tab at the top

### Step 3: Run the seed SQL
1. Open the file: `prisma/seed.sql`
2. Copy ALL the SQL content
3. Paste into phpMyAdmin SQL tab
4. Click **"Go"** button

**Done!** 🎉

## What Gets Created

- ✅ 2 Departments (Cyber Security, Mechanical Engineering)
- ✅ 2 Programmes (BEng CS, BEng ME)
- ✅ 1 Demo User (Military ID: 2101006)
- ✅ 1 Student Profile
- ✅ 4 Lab Categories
- ✅ 12 Labs (Arduino, Robotics, Cybersecurity, etc.)
- ✅ 3 Sample Projects
- ✅ 1 Event (Induction Week)

## Login Credentials

**Military ID:** `2101006`  
**Password:** `password123`

## Verify It Worked

In phpMyAdmin:
1. Click on `users` table → **Browse** → You should see 1 user
2. Click on `labs` table → **Browse** → You should see 12 labs
3. Click on `projects` table → **Browse** → You should see 3 projects

## Run the App

```bash
npm run dev
```

Visit `http://localhost:3000/login` and login with the credentials above!

## Alternative: Command Line

If you prefer command line:
```bash
mysql -u root afaq_innovation < prisma/seed.sql
```

## To Re-seed

If you want to start fresh:
1. Uncomment the `TRUNCATE TABLE` lines at the top of `seed.sql`
2. Run the SQL again in phpMyAdmin

This will clear all data and re-insert everything.
