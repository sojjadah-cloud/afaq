'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { RowDataPacket } from 'mysql2'

export async function createEvent(formData: FormData) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }
    if (session.role !== 'STAFF' && session.role !== 'ADMIN') {
        return { error: 'Not authorized' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const location = formData.get('location') as string
    const capacity = formData.get('capacity') as string
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string

    if (!title || !startDate) return { error: 'Missing required fields' }

    try {
        await query(
            `INSERT INTO events (id, title, description, category, startDate, endDate, location, capacity, createdById, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                `evt_${Date.now()}`,
                title,
                description || '',
                category || 'General',
                new Date(startDate),
                endDate ? new Date(endDate) : null,
                location || 'TBD',
                capacity ? parseInt(capacity) : null,
                session.userId
            ]
        )

        // Audit log
        try {
            await query(
                `INSERT INTO audit_logs (id, userId, action, tableName, recordId, newData, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [`log_${Date.now()}`, session.userId, 'EVENT_CREATED', 'events', eventId, JSON.stringify({ title, category, startDate })]
            )
        } catch (e) { /* Audit log is non-critical */ }

        revalidatePath('/events')
        return { success: true }
    } catch (error) {
        console.error('Create event error:', error)
        return { error: 'Failed to create event' }
    }
}

export async function registerForEvent(eventId: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }

    try {
        // Check availability
        const events = await query<RowDataPacket[]>('SELECT capacity FROM events WHERE id = ?', [eventId])
        const event = events[0]
        if (!event) return { error: 'Event not found' }

        if (event.capacity) {
            const countResult = await query<RowDataPacket[]>(
                'SELECT COUNT(*) as count FROM event_registrations WHERE eventId = ? AND status != "CANCELLED"',
                [eventId]
            )
            if (countResult[0].count >= event.capacity) {
                return { error: 'Event is full' }
            }
        }

        // Check existing registration
        const existing = await query<RowDataPacket[]>(
            'SELECT * FROM event_registrations WHERE eventId = ? AND userId = ?',
            [eventId, session.userId]
        )

        if (existing.length > 0) {
            return { error: 'Already registered' }
        }

        const regId = `evr_${Date.now()}`
        await query(
            `INSERT INTO event_registrations (id, eventId, userId, status, registeredAt)
             VALUES (?, ?, ?, 'REGISTERED', NOW())`,
            [regId, eventId, session.userId]
        )

        // Audit log
        try {
            await query(
                `INSERT INTO audit_logs (id, userId, action, tableName, recordId, newData, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [`log_${Date.now()}`, session.userId, 'EVENT_REGISTERED', 'event_registrations', regId, JSON.stringify({ eventId })]
            )
        } catch (e) { /* Audit log is non-critical */ }

        revalidatePath('/events')
        return { success: true }
    } catch (error) {
        console.error('Registration error:', error)
        return { error: 'Failed to register for event' }
    }
}

export async function cancelRegistration(eventId: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }

    try {
        await query(
            'UPDATE event_registrations SET status = "CANCELLED" WHERE eventId = ? AND userId = ?',
            [eventId, session.userId]
        )
        revalidatePath('/events')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to cancel registration' }
    }
}

export async function updateEvent(eventId: string, formData: FormData) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }
    if (session.role !== 'STAFF' && session.role !== 'ADMIN') {
        return { error: 'Not authorized' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const location = formData.get('location') as string
    const capacity = formData.get('capacity') as string
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string

    if (!title || !startDate) return { error: 'Missing required fields' }

    try {
        await query(
            `UPDATE events SET 
                title = ?, description = ?, category = ?, 
                startDate = ?, endDate = ?, location = ?, 
                capacity = ?, updatedAt = NOW()
             WHERE id = ?`,
            [
                title,
                description || '',
                category || 'General',
                new Date(startDate),
                endDate ? new Date(endDate) : null,
                location || 'TBD',
                capacity ? parseInt(capacity) : null,
                eventId
            ]
        )
        revalidatePath('/events')
        revalidatePath(`/events/${eventId}`)
        revalidatePath('/admin/events')
        return { success: true }
    } catch (error) {
        console.error('Update event error:', error)
        return { error: 'Failed to update event' }
    }
}

export async function deleteEvent(eventId: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }
    if (session.role !== 'STAFF' && session.role !== 'ADMIN') {
        return { error: 'Not authorized' }
    }

    try {
        // Delete registrations first
        await query('DELETE FROM event_registrations WHERE eventId = ?', [eventId])
        // Delete the event
        await query('DELETE FROM events WHERE id = ?', [eventId])

        revalidatePath('/events')
        revalidatePath('/admin/events')
        return { success: true }
    } catch (error) {
        console.error('Delete event error:', error)
        return { error: 'Failed to delete event' }
    }
}

export async function getEvents() {
    try {
        const events = await query<RowDataPacket[]>(`
            SELECT 
                e.*,
                (SELECT COUNT(*) FROM event_registrations er WHERE er.eventId = e.id AND er.status = 'REGISTERED') as registrationCount
            FROM events e
            ORDER BY e.startDate DESC
        `)
        return events
    } catch (error) {
        console.error('Get events error:', error)
        return []
    }
}

export async function getEventById(eventId: string) {
    try {
        const events = await query<RowDataPacket[]>('SELECT * FROM events WHERE id = ?', [eventId])
        return events[0] || null
    } catch (error) {
        console.error('Get event by ID error:', error)
        return null
    }
}

export async function getUserRegistration(eventId: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return null

    try {
        const regs = await query<RowDataPacket[]>(
            'SELECT * FROM event_registrations WHERE eventId = ? AND userId = ? AND status = "REGISTERED"',
            [eventId, session.userId]
        )
        return regs[0] || null
    } catch (error) {
        return null
    }
}

export async function getEventRegistrations(eventId: string) {
    const session = await getSession()
    if (!session.isLoggedIn || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
        return []
    }

    try {
        const registrations = await query<RowDataPacket[]>(`
            SELECT 
                er.id, er.status, er.registeredAt,
                u.militaryId, u.email,
                COALESCE(sp.fullName, u.email) as userName
            FROM event_registrations er
            JOIN users u ON er.userId COLLATE utf8mb4_general_ci = u.id COLLATE utf8mb4_general_ci
            LEFT JOIN student_profiles sp ON u.id COLLATE utf8mb4_general_ci = sp.userId COLLATE utf8mb4_general_ci
            WHERE er.eventId = ?
            ORDER BY er.registeredAt DESC
        `, [eventId])
        return registrations
    } catch (error) {
        console.error('Get event registrations error:', error)
        return []
    }
}
