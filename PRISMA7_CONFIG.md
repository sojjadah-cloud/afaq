# Prisma 7 Configuration - Quick Reference

## What Changed

Prisma 7 uses a new configuration system where the database URL is **no longer in schema.prisma**, but instead in **prisma.config.ts**.

## ✅ Fixed Configuration

### 1. `prisma.config.ts` (Database URL Location)
```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],  // ← URL is here now
  },
});
```

### 2. `prisma/schema.prisma` (No URL)
```prisma
datasource db {
  provider = "mysql"
  // ← No url line here anymore!
}
```

### 3. `.env.local` (phpMyAdmin Configuration)
```env
DATABASE_URL="mysql://root:@localhost:3306/afaq_innovation"
```

## Next Steps

Now that Prisma is fixed, run these commands in order:

```bash
# 1. Make sure MySQL/phpMyAdmin is running (XAMPP/WAMP)

# 2. Create database in phpMyAdmin
#    - Go to http://localhost/phpmyadmin
#    - Create database: afaq_innovation

# 3. Generate Prisma Client (already done ✓)
npx prisma generate

# 4. Create database tables
npx prisma migrate dev --name init

# 5. Seed sample data
npx prisma db seed

# 6. Start dev server
npm run dev
```

## Common Commands

```bash
# View database in browser GUI
npx prisma studio

# Reset database (Warning: deletes all data)
npx prisma migrate reset

# Create new migration after schema changes
npx prisma migrate dev --name your_migration_name
```

## Troubleshooting

### ERROR: Can't reach database
- Check if MySQL is running in XAMPP/WAMP
- Verify database `afaq_innovation` exists in phpMyAdmin
- Check `.env.local` has correct connection string

### ERROR: Migration failed
- Ensure database is empty for first migration
- Or use: `npx prisma migrate reset` to start fresh

### ERROR: Module not found 'dotenv'
Already fixed! We installed it: `npm install dotenv --save-dev`

## Summary of Changes

✅ **Removed** `url = env("DATABASE_URL")` from `schema.prisma`  
✅ **Kept** URL configuration in `prisma.config.ts`  
✅ **Installed** dotenv dependency  
✅ **Updated** `.env.local` for phpMyAdmin (no password)
