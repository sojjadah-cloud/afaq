'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { RowDataPacket } from '@/lib/types'

// ============== NOTIFICATIONS ==============

export async function getNotifications() {
    const session = await getSession()
    if (!session.isLoggedIn) return []

    try {
        const notifications = await query<RowDataPacket[]>(`
            SELECT * FROM notifications 
            WHERE userId = ?
            ORDER BY createdAt DESC
            LIMIT 20
        `, [session.userId])
        return notifications
    } catch (error) {
        console.error('Get notifications error:', error)
        return []
    }
}

export async function getUnreadCount() {
    const session = await getSession()
    if (!session.isLoggedIn) return 0

    try {
        const result = await query<RowDataPacket[]>(`
            SELECT COUNT(*) as count FROM notifications 
            WHERE userId = ? AND isRead = FALSE
        `, [session.userId])
        return result[0]?.count || 0
    } catch (error) {
        console.error('Get unread count error:', error)
        return 0
    }
}

export async function markAsRead(notificationId: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }

    try {
        await query(
            'UPDATE notifications SET isRead = TRUE WHERE id = ? AND userId = ?',
            [notificationId, session.userId]
        )
        return { success: true }
    } catch (error) {
        console.error('Mark as read error:', error)
        return { error: 'Failed to mark as read' }
    }
}

export async function markAllAsRead() {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }

    try {
        await query(
            'UPDATE notifications SET isRead = TRUE WHERE userId = ?',
            [session.userId]
        )
        return { success: true }
    } catch (error) {
        console.error('Mark all as read error:', error)
        return { error: 'Failed to mark all as read' }
    }
}

export async function createNotification(userId: string, type: string, title: string, message?: string, link?: string) {
    try {
        const notifId = `notif_${Date.now()}`
        await query(
            `INSERT INTO notifications (id, userId, type, title, message, link, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [notifId, userId, type, title, message || null, link || null]
        )
        return { success: true }
    } catch (error) {
        console.error('Create notification error:', error)
        return { error: 'Failed to create notification' }
    }
}

// ============== AUDIT LOGGING ==============

export async function logAction(
    action: string,
    tableName?: string,
    recordId?: string,
    oldData?: any,
    newData?: any
) {
    const session = await getSession()

    try {
        const logId = `log_${Date.now()}`
        await query(
            `INSERT INTO audit_logs (id, userId, action, tableName, recordId, oldData, newData, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                logId,
                session.userId || null,
                action,
                tableName || null,
                recordId || null,
                oldData ? JSON.stringify(oldData) : null,
                newData ? JSON.stringify(newData) : null
            ]
        )
        return { success: true }
    } catch (error) {
        console.error('Audit log error:', error)
        return { error: 'Failed to log action' }
    }
}

export async function getAuditLogs(limit: number = 50) {
    const session = await getSession()
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
        return []
    }

    try {
        const logs = await query<RowDataPacket[]>(`
            SELECT 
                al.*,
                u.militaryId,
                COALESCE(sp.fullName, u.email) as userName
            FROM audit_logs al
            LEFT JOIN users u ON al.userId COLLATE utf8mb4_general_ci = u.id COLLATE utf8mb4_general_ci
            LEFT JOIN student_profiles sp ON u.id COLLATE utf8mb4_general_ci = sp.userId COLLATE utf8mb4_general_ci
            ORDER BY al.createdAt DESC
            LIMIT ?
        `, [limit])
        return logs
    } catch (error) {
        console.error('Get audit logs error:', error)
        return []
    }
}
