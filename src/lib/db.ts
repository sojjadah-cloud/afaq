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

    return db
}

// MySQL syntax the original queries still use, translated to SQLite equivalents
// at the query layer so call sites never had to change.
function toSqlite(sql: string): string {
    return sql.replace(/\bNOW\(\)/gi, 'CURRENT_TIMESTAMP')
}

export async function query<T>(sql: string, params: any[] = []): Promise<T> {
    try {
        const database = getDb()
        const translated = toSqlite(sql)
        const stmt = database.prepare(translated)

        if (stmt.reader) {
            return stmt.all(...params) as T
        }

        stmt.run(...params)
        return [] as T
    } catch (error) {
        console.error('Database query error:', error)
        throw error
    }
}
