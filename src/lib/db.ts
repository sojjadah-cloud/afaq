import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

function getPool(): mysql.Pool {
    if (pool) return pool

    const DATABASE_URL = process.env.DATABASE_URL

    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set')
    }

    // Parse DATABASE_URL to check if it's a production environment (PlanetScale/cloud)
    const isProduction = DATABASE_URL.includes('psdb.cloud') ||
        DATABASE_URL.includes('railway') ||
        DATABASE_URL.includes('neon') ||
        DATABASE_URL.includes('filess.io') ||
        process.env.NODE_ENV === 'production'

    // Create connection pool with production-optimized settings
    pool = mysql.createPool({
        uri: DATABASE_URL,
        waitForConnections: true,
        connectionLimit: isProduction ? 2 : 10, // Reduced to 2 for free tier database limits
        maxIdle: isProduction ? 1 : 10,
        idleTimeout: 60000, // 60 seconds
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        // SSL configuration for production databases
        ...(isProduction && {
            ssl: {
                rejectUnauthorized: false // Accept self-signed certificates
            }
        })
    })

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

    return pool
}

export async function query<T>(sql: string, params?: any[]): Promise<T> {
    try {
        const [rows] = await getPool().execute(sql, params)
        return rows as T
    } catch (error) {
        console.error('Database query error:', error)
        throw error
    }
}
