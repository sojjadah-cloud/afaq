import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

let db: Database.Database | null = null

function getDb(): Database.Database {
    if (db) return db

    const dataDir = path.join(process.cwd(), 'data')
    fs.mkdirSync(dataDir, { recursive: true })

    const dbPath = process.env.DATABASE_URL || path.join(dataDir, 'afaq.db')
    const isFreshDb = !fs.existsSync(dbPath)

    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = OFF')

    if (isFreshDb) {
        const seedPath = path.join(dataDir, 'seed.sql')
        if (fs.existsSync(seedPath)) {
            const seedSql = fs.readFileSync(seedPath, 'utf-8')
            db.exec(seedSql)
            console.log('✅ SQLite database created and seeded from data/seed.sql')
        } else {
            console.error('⚠️ data/seed.sql not found — database created empty')
        }
    } else {
        console.log('✅ SQLite database connected')
    }

    ensureSchema(db)
    return db
}

// Brings databases created from an older seed.sql up to the current schema.
function ensureSchema(database: Database.Database) {
    const addColumn = (table: string, column: string, definition: string) => {
        const cols = database.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]
        if (!cols.some(c => c.name === column)) {
            database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
        }
    }
    addColumn('users', 'isActive', 'tinyint(1) NOT NULL DEFAULT 1')
    addColumn('users', 'sessionVersion', 'int(11) NOT NULL DEFAULT 0')
    addColumn('projects', 'departmentId', 'varchar(191) DEFAULT NULL')
    addColumn('events', 'eventType', "varchar(191) NOT NULL DEFAULT 'CLUB'")
    addColumn('club_news', 'location', 'varchar(191) DEFAULT NULL')
    addColumn('labs', 'location', 'varchar(191) DEFAULT NULL')
    addColumn('lab_categories', 'technician', 'varchar(191) DEFAULT NULL')
    addColumn('lab_categories', 'technicianContact', 'varchar(191) DEFAULT NULL')
    addColumn('lab_categories', 'sortOrder', 'int(11) NOT NULL DEFAULT 0')
    addColumn('projects', 'supervisorId', 'varchar(191) DEFAULT NULL')
    addColumn('lab_bookings', 'returnDate', 'varchar(10) DEFAULT NULL')
    addColumn('lab_bookings', 'returnNote', 'text DEFAULT NULL')
    addColumn('events', 'registrationDeadline', 'datetime(3) DEFAULT NULL')
    addColumn('event_registrations', 'attended', 'tinyint(1) NOT NULL DEFAULT 0')
    database.exec(`CREATE TABLE IF NOT EXISTS project_updates (
        id varchar(191) NOT NULL PRIMARY KEY,
        projectId varchar(191) NOT NULL,
        userId varchar(191) NOT NULL,
        type varchar(20) NOT NULL,
        message text NOT NULL,
        progress int(11) DEFAULT NULL,
        createdAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)
    database.exec('CREATE INDEX IF NOT EXISTS project_updates_projectId_idx ON project_updates (projectId)')
    const hadCourses = !!database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'courses'").get()
    database.exec(`CREATE TABLE IF NOT EXISTS courses (
        id varchar(191) NOT NULL PRIMARY KEY,
        title varchar(200) NOT NULL,
        kind varchar(20) NOT NULL DEFAULT 'COURSE',
        field varchar(40) NOT NULL,
        summary text NOT NULL,
        videoUrl varchar(500) NOT NULL,
        instructor varchar(120) DEFAULT NULL,
        duration varchar(60) DEFAULT NULL,
        createdById varchar(191) DEFAULT NULL,
        createdAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)
    database.exec('CREATE INDEX IF NOT EXISTS courses_field_idx ON courses (field)')
    if (!hadCourses) {
        // First course, added once when the table is created.
        database.prepare(
            `INSERT INTO courses (id, title, kind, field, summary, videoUrl, instructor, createdAt, updatedAt)
             VALUES (?, ?, 'COURSE', 'AI', ?, ?, ?, strftime('%Y-%m-%d %H:%M:%f', 'now', '+4 hours'), strftime('%Y-%m-%d %H:%M:%f', 'now', '+4 hours'))`
        ).run(
            'course_ai_agent_basics',
            'من الصفر: كيف تبني AI Agent',
            'دورة مرئية باللغة العربية تشرح بناء وكيل ذكاء اصطناعي (AI Agent) من الصفر خطوة بخطوة، مناسبة للمهتمين بتطبيقات الذكاء الاصطناعي والأتمتة في مشاريعهم.',
            'https://youtu.be/Zha_WTPDckI',
            'Tariq Elouzeh | طارق العوزة'
        )
    }
    database.exec(`CREATE TABLE IF NOT EXISTS files (
        id varchar(191) NOT NULL PRIMARY KEY,
        name varchar(255) NOT NULL,
        mimeType varchar(191) NOT NULL,
        size int(11) NOT NULL,
        data blob NOT NULL,
        uploadedById varchar(191) DEFAULT NULL,
        createdAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)
}

// MySQL syntax the original queries still use, translated to SQLite equivalents
// at the query layer so call sites never had to change.
function toSqlite(sql: string): string {
    // Stored dates are Oman wall-clock time (UTC+4, no daylight saving), like the seed data,
    // so NOW() must not fall back to SQLite's UTC CURRENT_TIMESTAMP.
    return sql.replace(/\bNOW\(\)/gi, "strftime('%Y-%m-%d %H:%M:%f', 'now', '+4 hours')")
}

// mysql2 accepted booleans and Dates as parameters; better-sqlite3 does not.
// Dates are stored as local 'YYYY-MM-DD HH:MM:SS.mmm', matching the seed data.
function toSqliteParam(value: any) {
    if (typeof value === 'boolean') return value ? 1 : 0
    if (value instanceof Date) {
        const pad = (n: number, w = 2) => String(n).padStart(w, '0')
        return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ` +
            `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}.${pad(value.getMilliseconds(), 3)}`
    }
    if (value === undefined) return null
    return value
}

export async function query<T>(sql: string, params: any[] = []): Promise<T> {
    try {
        const database = getDb()
        const translated = toSqlite(sql)
        const stmt = database.prepare(translated)
        const bound = params.map(toSqliteParam)

        if (stmt.reader) {
            return stmt.all(...bound) as T
        }

        stmt.run(...bound)
        return [] as T
    } catch (error) {
        console.error('Database query error:', error)
        throw error
    }
}
