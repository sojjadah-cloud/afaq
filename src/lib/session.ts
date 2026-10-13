import type { IronSession } from 'iron-session'
import { query } from './db'
import { RowDataPacket } from './types'
import type { SessionData } from './auth'

export interface ActiveUser {
    id: string
    role: string
}

// A session is only valid while its user still exists, is active, and its
// sessionVersion matches. Bumping users.sessionVersion (role change, password
// change, deactivation) signs that user out everywhere.
export async function getActiveUser(session: IronSession<SessionData>): Promise<ActiveUser | null> {
    if (!session.isLoggedIn || !session.userId) return null
    const rows = await query<RowDataPacket[]>(
        'SELECT id, role, isActive, sessionVersion FROM users WHERE id = ?',
        [session.userId]
    )
    const user = rows[0]
    if (!user || !user.isActive) return null
    if ((Number(user.sessionVersion) || 0) !== (session.sessionVersion || 0)) return null
    return { id: user.id, role: user.role }
}
