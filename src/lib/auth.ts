import { getIronSession, IronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import fs from 'fs'
import path from 'path'

export const SESSION_COOKIE = 'afaq_session'

export interface SessionData {
    userId: string
    militaryId: string
    email: string
    role: string
    isLoggedIn: boolean
    sessionVersion?: number
}

let cachedSecret: string | null = null

// Uses SESSION_SECRET when it is set. Otherwise a random secret is generated on
// first start and kept next to the database, so it never appears in the source
// code (a known secret would let anyone forge a session).
function sessionSecret(): string {
    if (cachedSecret) return cachedSecret

    const fromEnv = process.env.SESSION_SECRET
    if (fromEnv && fromEnv.length >= 32) {
        cachedSecret = fromEnv
        return cachedSecret
    }

    const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'afaq.db')
    const dir = path.dirname(dbPath)
    const file = path.join(dir, '.session-secret')
    fs.mkdirSync(dir, { recursive: true })
    try {
        fs.writeFileSync(file, randomBytes(32).toString('hex'), { flag: 'wx', mode: 0o600 })
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
    }
    cachedSecret = fs.readFileSync(file, 'utf-8').trim()
    return cachedSecret
}

function sessionOptions(): SessionOptions {
    return {
        password: sessionSecret(),
        cookieName: SESSION_COOKIE,
        cookieOptions: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        },
    }
}

export async function getSession(): Promise<IronSession<SessionData>> {
    const cookieStore = await cookies()
    return getIronSession<SessionData>(cookieStore, sessionOptions())
}
