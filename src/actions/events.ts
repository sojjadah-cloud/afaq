'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { RowDataPacket } from 'mysql2'

export async function createEvent(formData: FormData) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }
    if (session.userRole !== 'STAFF' && session.userRole !== 'ADMIN') {
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

        await query(
            `INSERT INTO event_registrations (id, eventId, userId, status, registeredAt)
             VALUES (?, ?, ?, 'REGISTERED', NOW())`,
            [`evr_${Date.now()}`, eventId, session.userId]
        )

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
