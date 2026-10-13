import { randomBytes } from 'crypto'
import { query } from './db'

// Server-side helper (not a server action), so clients can't create notifications for other users.
export async function createNotification(userId: string, type: string, title: string, message?: string, link?: string) {
    try {
        await query(
            `INSERT INTO notifications (id, userId, type, title, message, link, isRead, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`,
            [`notif_${Date.now()}_${randomBytes(4).toString('hex')}`, userId, type, title, message || null, link || null]
        )
    } catch (error) {
        console.error('Failed to create notification:', error)
    }
}
