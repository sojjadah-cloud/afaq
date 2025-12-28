import mysql from 'mysql2/promise'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
}

// Parse DATABASE_URL to check if it's a production environment (PlanetScale/cloud)
const isProduction = DATABASE_URL.includes('psdb.cloud') ||
    DATABASE_URL.includes('railway') ||
    DATABASE_URL.includes('neon') ||
    process.env.NODE_ENV === 'production'

// Create connection pool with production-optimized settings
const pool = mysql.createPool({
    uri: DATABASE_URL,
    waitForConnections: true,
    connectionLimit: isProduction ? 5 : 10, // Lower limit for serverless
    maxIdle: isProduction ? 2 : 10,
    idleTimeout: 60000, // 60 seconds
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // SSL configuration for production databases
    ...(isProduction && {
        ssl: {
            rejectUnauthorized: true
        }
    })
})

// Test connection on startup
pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully')
        connection.release()
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message)
        if (isProduction) {
            console.error('Check your DATABASE_URL environment variable')
        }
    })

export async function query<T>(sql: string, params?: any[]): Promise<T> {
    try {
        const [rows] = await pool.execute(sql, params)
        return rows as T
    } catch (error) {
        console.error('Database query error:', error)
        throw error
    }
}
