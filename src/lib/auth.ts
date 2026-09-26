import { getIronSession, IronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
    userId: string
    militaryId: string
    email: string
    role: string
    isLoggedIn: boolean
}

// Iron-session requires a password of at least 32 characters. Fall back to an
// insecure development secret so a missing env var degrades to "not logged
// in" instead of crashing every request; set SESSION_SECRET in the hosting
// environment for real deployments.
if (!process.env.SESSION_SECRET) {
    console.error('⚠️ SESSION_SECRET is not set — using an insecure fallback. Set it in your hosting environment.')
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'insecure-fallback-session-secret-please-set-a-real-one-32chars'

const sessionOptions: SessionOptions = {
    password: SESSION_SECRET,
    cookieName: 'afaq_session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    },
}

export async function getSession(): Promise<IronSession<SessionData>> {
    const cookieStore = await cookies()
    return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function requireAuth() {
    const session = await getSession()

    if (!session.isLoggedIn) {
        throw new Error('Unauthorized')
    }

    return session
}
