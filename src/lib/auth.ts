import { getIronSession, IronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
    userId: string
    militaryId: string
    email: string
    role: string
    isLoggedIn: boolean
}

const sessionOptions: SessionOptions = {
    password: process.env.SESSION_SECRET!,
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
