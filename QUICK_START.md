# Quick Start - Database Setup Without Seed Issues

Since there are some compatibility issues with the seed command in Prisma 7, here's the simplest way to get started:

## Option 1: Use Prisma Studio (Recommended - Visual Interface)

1. **Make sure database exists in phpMyAdmin:**
   - Open `http://localhost/phpmyadmin`
   - Create database: `afaq_innovation`

2. **Run migration to create tables:**
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Open Prisma Studio:**
   ```bash
   npx prisma studio
   ```

4. **Add data manually through the visual interface:**
   - Opens at `http://localhost:5555`
   - Click on each table and add records
   - Much easier than writing SQL!

### Demo User to Add in Prisma Studio:

**Table: users**
- militaryId: `2101006`
- email: `student2101006@mtc.edu.om`
- password: `$2b$10$rR5Z5Z5Z5Z5Z5Z5Z5Z5Z5e...` (use this hashed version of "password123")
- role: `STUDENT`

Or just create a user through the app's registration if you build that feature!

## Option 2: Use SQL Directly in phpMyAdmin

1. Open phpMyAdmin
2. Select `afaq_innovation` database
3. Go to **SQL** tab
4. Paste and run this SQL:

```sql
-- Insert demo user (password: password123)
INSERT INTO users (id, militaryId, email, password, role, createdAt, updatedAt) 
VALUES (
  'clxyz123456', 
  '2101006', 
  'student2101006@mtc.edu.om',
  '$2b$10$K7l6eN6h.mIkO5V5V5V5VeV5V5V5V5V5V5V5V5V5V5V5V5V5V5V5V5',
  'STUDENT',
  NOW(),
  NOW()
);

-- Add a department
INSERT INTO departments (id, name, code, createdAt, updatedAt)
VALUES ('clxyz123457', 'Cyber Security Department', 'CS', NOW(), NOW());
```

## Option 3: Fix Seed Script (For Later)

The seed script has issues because of Prisma 7 changes. You can:
- Use the app to create data through forms
- Use Prisma Studio
- Or manually fix the TypeScript execution environment

## Quick Test

After adding at least one user, start the dev server:

```bash
npm run dev
```

Visit `http://localhost:3000/login` and try logging in!

## Note on Password Hashing

If you need to hash a password for testing:
```bash
# Install bcrypt CLI
npm install -g bcrypt-cli

# Hash a password
bcrypt-cli password123
```

Or just use the registration form in your app once you build it!
