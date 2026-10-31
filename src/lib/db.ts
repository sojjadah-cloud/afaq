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
    applyArabicContent(db, path.join(dataDir, 'content-ar.json'))
    return db
}

// Content columns that have an Arabic counterpart named <column>Ar.
export const ARABIC_COLUMNS: Record<string, string[]> = {
    projects: ['title', 'description'],
    events: ['title', 'description', 'location'],
    club_news: ['title', 'summary', 'location'],
    research: ['title', 'abstract', 'authors'],
    labs: ['name', 'shortDesc', 'location'],
    lab_categories: ['technician'],
    student_profiles: ['fullName'],
    forum_posts: ['title', 'content'],
    project_updates: ['message'],
}

// Fills the Arabic columns of the bundled demo records from data/content-ar.json.
// Only empty Arabic fields are written, so translations entered in the portal are never replaced.
function applyArabicContent(database: Database.Database, file: string) {
    if (!fs.existsSync(file)) return
    try {
        const content = JSON.parse(fs.readFileSync(file, 'utf-8')) as Record<string, Record<string, Record<string, string>>>
        const fill = database.transaction(() => {
            for (const [table, records] of Object.entries(content)) {
                const columns = ARABIC_COLUMNS[table]
                if (!columns) continue
                const key = table === 'student_profiles' ? 'userId' : 'id'
                for (const [id, fields] of Object.entries(records)) {
                    for (const [column, value] of Object.entries(fields)) {
                        if (!columns.includes(column) || !value) continue
                        database.prepare(
                            `UPDATE ${table} SET ${column}Ar = ? WHERE ${key} = ? AND (${column}Ar IS NULL OR ${column}Ar = '')`
                        ).run(value, id)
                    }
                }
            }
        })
        fill()
    } catch (error) {
        console.error('Could not apply Arabic content:', error)
    }
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
    // Arabic versions of content; the original columns hold the English text.
    for (const [table, columns] of Object.entries(ARABIC_COLUMNS)) {
        for (const column of columns) addColumn(table, `${column}Ar`, 'text DEFAULT NULL')
    }
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
    for (const column of ['title', 'summary', 'instructor', 'duration']) addColumn('courses', `${column}Ar`, 'text DEFAULT NULL')
    if (!hadCourses) {
        // First course, added once when the table is created.
        database.prepare(
            `INSERT INTO courses (id, title, titleAr, kind, field, summary, summaryAr, videoUrl, instructor, instructorAr, createdAt, updatedAt)
             VALUES (?, ?, ?, 'COURSE', 'AI', ?, ?, ?, ?, ?, strftime('%Y-%m-%d %H:%M:%f', 'now', '+4 hours'), strftime('%Y-%m-%d %H:%M:%f', 'now', '+4 hours'))`
        ).run(
            'course_ai_agent_basics',
            'From Scratch: How to Build an AI Agent',
            'من الصفر: كيف تبني AI Agent',
            'A video course in Arabic that walks through building an AI agent from scratch, step by step. Suited to members interested in using AI and automation in their projects.',
            'دورة مرئية باللغة العربية تشرح بناء وكيل ذكاء اصطناعي (AI Agent) من الصفر خطوة بخطوة، مناسبة للمهتمين بتطبيقات الذكاء الاصطناعي والأتمتة في مشاريعهم.',
            'https://youtu.be/Zha_WTPDckI',
            'Tariq Elouzeh',
            'طارق العوزة'
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
