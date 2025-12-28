# AFAQ Innovation Portal - Next.js

A full-stack Next.js application for the AFAQ Innovation Portal at the Military Technological College, migrated from static HTML/CSS/JS to a production-ready system with MySQL database integration.

## Features

✅ **Authentication System**  
- Secure login with bcrypt password hashing
- Session management with iron-session
- Military ID-based authentication

✅ **Database Integration**  
- MySQL database with Prisma ORM
- 15+ data models covering all application needs
- Automatic migrations and seeding

✅ **Pages & Features**  
- Home dashboard with hero slider
- Projects management (Start/Development/Completed)
- Labs & Equipment booking system
- Events calendar
- Research hub  
- Student profiles with CV builder

✅ **Modern Stack**  
- Next.js 14+ with App Router
- TypeScript for type safety
- Server Components & Server Actions
- CSS Modules (retaining original design)

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL database
- npm

### Installation

1. **Clone or navigate to the project:**
   ```bash
   cd "c:\Users\OMXQN\Desktop\afaq innovation\afaq-innovation-nextjs"
   ```

2. **Configure environment:**
   
   Edit `.env.local` and update your database connection:
   ```env
   DATABASE_URL="mysql://root:your_password@localhost:3306/afaq_innovation"
   SESSION_SECRET="your-secure-random-string-here"
   ```

3. **Set up database:**
   ```bash
   # Create database migration
   npx prisma migrate dev --name init
   
   # Seed with sample data
   npx prisma db seed
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

### Default Login

**Military ID:** `2101006`  
**Password:** `password123`

## Project Structure

```
afaq-innovation-nextjs/
├── prisma/
│   ├── schema.prisma          # Database schema (15+ models)
│   └── seed.ts                # Sample data seeder
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout with Header/Nav/Footer
│   │   ├── page.tsx           # Home page
│   │   ├── login/             # Authentication
│   │   ├── equipment/         # Labs & Equipment
│   │   ├── projects/          # Innovation Projects  
│   │   ├── events/            # Events Calendar
│   │   ├── research/          # Research Hub
│   │   └── student/           # Student Profile
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utilities & Prisma client
│   └── actions/               # Server Actions
└── SETUP.md                   # Detailed setup guide
```

## Database Models

- **Users & Authentication:** User, StudentProfile
- **Academic:** Department, Programme
- **Projects:** Project, ProjectMember (with START/DEVELOPMENT/COMPLETED statuses)
- **Labs:** Lab, LabCategory, LabBooking
- **Events:** Event, EventRegistration
- **Student CV:** Experience, Training, Competition, Skill
- **Research:** Research publications

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# View database with Prisma Studio
npx prisma studio

# Create new migration after schema changes
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Technologies

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Database:** MySQL
- **ORM:** Prisma
- **Auth:** iron-session + bcrypt
- **Styling:** CSS Modules (original gold theme preserved)

## Migration Notes

This application was migrated from static HTML/CSS/JavaScript to Next.js while:
- ✅ Preserving the original gold color scheme (`#938029`)
- ✅ Maintaining responsive design
- ✅ Keeping all Font Awesome icons
- ✅ Converting localStorage to secure database storage
- ✅ Implementing proper authentication vs. client-side login

## Documentation

- See [SETUP.md](./SETUP.md) for detailed setup instructions
- See implementation plan for architecture details

## Production Deployment

1. Set environment variables:
   - `DATABASE_URL` (production MySQL connection)
   - `SESSION_SECRET` (strong random string, 32+ characters)
   
2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

3. Build application:
   ```bash
   npm run build
   ```

4. Start server:
   ```bash
   npm start
   ```

## License

Internal use - Military Technological College, Sultanate of Oman
