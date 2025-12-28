# AFAQ Innovation Portal - Setup Guide

## Prerequisites

1. **Node.js** (v18 or later)  
2. **MySQL** database server running locally or remotely
3. **npm** package manager

## Step-by-Step Setup

### 1. Install Additional Dependencies

```bash
cd "c:\Users\OMXQN\Desktop\afaq innovation\afaq-innovation-nextjs"
npm install ts-node --save-dev
```

### 2. Configure Database Connection

Edit the `.env.local` file and update the `DATABASE_URL`:

```env
# For local MySQL (update username, password, and database name)
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/afaq_innovation"

# For Docker MySQL (example)
# DATABASE_URL="mysql://root:password@localhost:3306/afaq_innovation"

# For cloud database (PlanetScale, Railway, etc.)
# DATABASE_URL="mysql://user:password@host:port/database"
```

**Generate a secure session secret:**
```bash
# Replace the SESSION_SECRET in .env.local with a random string
```

### 3. Create and Seed the Database

```bash
# Create the database migration
npx prisma migrate dev --name init

# Seed the database with sample data
npx prisma db seed
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Default Login Credentials

**Military ID:** `2101006`  
**Password:** `password123`

## Database Management

### View Database with Prisma Studio
```bash
npx prisma studio
```

### Reset Database (WARNING: Deletes all data)
```bash
npx prisma migrate reset
```

### Create New Migration After Schema Changes
```bash
npx prisma migrate dev --name migration_name
```

## Project Structure

```
afaq-innovation-nextjs/
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Sample data
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # Reusable components
│   ├── lib/              # Utility functions
│   └── actions/          # Server actions
├── .env.local            # Environment variables (not in git)
└── package.json
```

## Troubleshooting

### MySQL Connection Issues
- Ensure MySQL is running
- Check username/password in DATABASE_URL
- Verify database exists: `CREATE DATABASE afaq_innovation;`

### Prisma Client Not Found
```bash
npx prisma generate
```

### Session Errors
- Ensure SESSION_SECRET is set in .env.local
- Must be at least 32 characters long

## Production Deployment

1. Set secure DATABASE_URL in production environment
2. Generate a strong SESSION_SECRET
3. Run migrations: `npx prisma migrate deploy`
4. Build the app:  `npm run build`
5. Start: `npm start`
