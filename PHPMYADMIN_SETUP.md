# phpMyAdmin Setup Guide for AFAQ Innovation Portal

## Step 1: Start XAMPP/WAMP

1. Open **XAMPP Control Panel** (or WAMP)
2. Start **Apache** and **MySQL** services
3. Ensure MySQL is running (green status)

## Step 2: Access phpMyAdmin

1. Open your browser
2. Navigate to: `http://localhost/phpmyadmin`
3. You should see the phpMyAdmin interface

## Step 3: Create the Database

1. Click on **"New"** in the left sidebar (or **"Databases"** tab)
2. Enter database name: `afaq_innovation`
3. Select collation: `utf8mb4_general_ci` (recommended)
4. Click **"Create"**

## Step 4: Verify Database Configuration

Your `.env.local` is now configured with:
```env
DATABASE_URL="mysql://root:@localhost:3306/afaq_innovation"
```

**Notes:**
- `root` is the default XAMPP MySQL username
- Empty password (`:@`) is XAMPP default
- If you set a password in phpMyAdmin, update it like: `mysql://root:YOUR_PASSWORD@localhost:3306/afaq_innovation`

## Step 5: Run Prisma Migrations

Open your terminal in the project directory and run:

```bash
cd "c:\Users\OMXQN\Desktop\afaq innovation\afaq-innovation-nextjs"

# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Seed sample data
npx prisma db seed
```

## Step 6: Verify in phpMyAdmin

1. Go back to phpMyAdmin
2. Click on `afaq_innovation` database in left sidebar
3. You should see tables:
   - users
   - student_profiles
   - departments
   - programmes
   - projects
   - labs
   - lab_categories
   - events
   - and more...

## Step 7: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Default Login Credentials

**Military ID:** `2101006`  
**Password:** `password123`

## Troubleshooting

### MySQL Connection Refused
- Ensure MySQL is running in XAMPP/WAMP Control Panel
- Check if port 3306 is being used by another service

### Access Denied Error
- Verify your MySQL username/password in phpMyAdmin
- Update `.env.local` if you've set a password

### Tables Not Created
- Make sure you're in the correct database (`afaq_innovation`)
- Check terminal for migration errors
- Try: `npx prisma migrate reset` (WARNING: deletes all data)

### View Your Data
```bash
# Open Prisma Studio (graphical database viewer)
npx prisma studio
```

## Common phpMyAdmin Tasks

### View Users Table
1. Click `afaq_innovation` → `users` table
2. Click **"Browse"** to see user records

### Run SQL Queries
1. Click on `afaq_innovation` database
2. Go to **"SQL"** tab
3. Run queries like:
   ```sql
   SELECT * FROM users;
   SELECT * FROM projects;
   SELECT * FROM labs;
   ```

### Export Database (Backup)
1. Click `afaq_innovation`
2. Go to **"Export"** tab
3. Choose **"Quick"** method
4. Click **"Go"** to download SQL file

### Import Database (Restore)
1. Click `afaq_innovation`
2. Go to **"Import"** tab
3. Choose your SQL file
4. Click **"Go"**

## Production Notes

For production deployment:
- Set a strong MySQL password
- Update `SESSION_SECRET` to a secure random string
- Never commit `.env.local` to version control
- Use environment variables on your hosting platform
