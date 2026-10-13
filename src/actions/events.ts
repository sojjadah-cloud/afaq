'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { RowDataPacket } from '@/lib/types'
import { eventTypeOf } from '@/lib/eventTypes'
import { getActiveUser } from '@/lib/session'
import { nowInOman } from '@/lib/utils'
import { eventStatus, minute, EVENT_STATUS_LABELS } from '@/lib/eventStatus'
import { randomBytes } from 'crypto'

// Validates and normalises the event form shared by create and update.
function readEventForm(formData: FormData) {
    const text = (key: string) => String(formData.get(key) || '').trim()
    const title = text('title')
    const startDate = minute(text('startDate'))
    const endDate = minute(text('endDate'))
    const registrationDeadline = minute(text('registrationDeadline'))
    const capacityText = text('capacity')
    const capacity = capacityText ? Number(capacityText) : null

    if (!title || !startDate) return { error: 'Title and start date are required' }
    if (title.length > 200) return { error: 'Keep the title under 200 characters' }
    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(startDate)) return { error: 'Start date is not valid' }
    if (endDate && endDate < startDate) return { error: 'The end must be after the start' }
    if (registrationDeadline && registrationDeadline > startDate) return { error: 'Registration must close before the event starts' }
    if (capacity !== null && (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000)) {
        return { error: 'Capacity must be a whole number between 1 and 10000' }
    }

    return {
        values: {
            title,
            description: text('description'),
            category: text('category') || 'General',
            eventType: eventTypeOf(formData.get('eventType')),
            location: text('location') || 'TBD',
            startDate,
            endDate: endDate || null,
            registrationDeadline: registrationDeadline || null,
            capacity,
        },
    }
}

async function requireStaff() {
    const user = await getActiveUser(await getSession())
    if (!user) return { error: 'Not authenticated' }
    if (user.role !== 'STAFF' && user.role !== 'ADMIN') return { error: 'Not authorized' }
    return { user }
}

export async function createEvent(formData: FormData) {
    const auth = await requireStaff()
    if ('error' in auth) return { error: auth.error }
    const form = readEventForm(formData)
    if ('error' in form) return { error: form.error }
    const v = form.values
    const session = { userId: auth.user.id }
    const { title, category, startDate } = v

    try {
        const eventId = `evt_${Date.now()}_${randomBytes(3).toString('hex')}`
        await query(
            `INSERT INTO events (id, title, description, category, eventType, startDate, endDate, registrationDeadline, location, capacity, createdById, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [eventId, v.title, v.description, v.category, v.eventType, v.startDate, v.endDate, v.registrationDeadline, v.location, v.capacity, session.userId]
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
    const user = await getActiveUser(await getSession())
    if (!user) return { error: 'Please log in to register' }
    const session = { userId: user.id }

    try {
        const events = await query<RowDataPacket[]>(
            'SELECT startDate, endDate, registrationDeadline, capacity FROM events WHERE id = ?',
            [eventId]
        )
        const event = events[0]
        if (!event) return { error: 'Event not found' }

        const countResult = await query<RowDataPacket[]>(
            "SELECT COUNT(*) as count FROM event_registrations WHERE eventId = ? AND status = 'REGISTERED' AND userId != ?",
            [eventId, user.id]
        )
        const status = eventStatus(event, Number(countResult[0]?.count) || 0, nowInOman())
        if (status !== 'OPEN') {
            return { error: status === 'FULL' ? 'Event is full' : `${EVENT_STATUS_LABELS[status]}. You can no longer register.` }
        }

        // Check existing registration
        const existing = await query<RowDataPacket[]>(
            'SELECT * FROM event_registrations WHERE eventId = ? AND userId = ?',
            [eventId, session.userId]
        )

        if (existing.length > 0) {
            if (existing[0].status !== 'CANCELLED') {
                return { error: 'Already registered' }
            }
            await query(
                "UPDATE event_registrations SET status = 'REGISTERED', registeredAt = NOW() WHERE id = ?",
                [existing[0].id]
            )
            revalidatePath('/events')
            return { success: true }
        }

        const regId = `evr_${Date.now()}_${randomBytes(3).toString('hex')}`
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
    const user = await getActiveUser(await getSession())
    if (!user) return { error: 'Not authenticated' }
    const session = { userId: user.id }

    try {
        const events = await query<RowDataPacket[]>('SELECT startDate FROM events WHERE id = ?', [eventId])
        if (!events[0]) return { error: 'Event not found' }
        if (nowInOman() >= minute(events[0].startDate)) {
            return { error: 'The event has already started' }
        }
        await query(
            "UPDATE event_registrations SET status = 'CANCELLED', attended = 0 WHERE eventId = ? AND userId = ?",
            [eventId, session.userId]
        )
        revalidatePath('/events')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to cancel registration' }
    }
}

export async function updateEvent(eventId: string, formData: FormData) {
    const auth = await requireStaff()
    if ('error' in auth) return { error: auth.error }
    const form = readEventForm(formData)
    if ('error' in form) return { error: form.error }
    const v = form.values

    try {
        if (v.capacity !== null) {
            const taken = await query<RowDataPacket[]>(
                "SELECT COUNT(*) as count FROM event_registrations WHERE eventId = ? AND status = 'REGISTERED'",
                [eventId]
            )
            if ((Number(taken[0]?.count) || 0) > v.capacity) {
                return { error: `${taken[0].count} people are already registered. Capacity cannot be lower than that.` }
            }
        }
        await query(
            `UPDATE events SET
                title = ?, description = ?, category = ?, eventType = ?,
                startDate = ?, endDate = ?, registrationDeadline = ?, location = ?,
                capacity = ?, updatedAt = NOW()
             WHERE id = ?`,
            [v.title, v.description, v.category, v.eventType, v.startDate, v.endDate, v.registrationDeadline, v.location, v.capacity, eventId]
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
    const auth = await requireStaff()
    if ('error' in auth) return { error: auth.error }

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
            'SELECT * FROM event_registrations WHERE eventId = ? AND userId = ? AND status = \'REGISTERED\'',
            [eventId, session.userId]
        )
        return regs[0] || null
    } catch (error) {
        return null
    }
}

export async function getEventRegistrations(eventId: string) {
    const auth = await requireStaff()
    if ('error' in auth) return []

    try {
        const registrations = await query<RowDataPacket[]>(`
            SELECT 
                er.id, er.status, er.registeredAt, er.attended,
                u.militaryId, u.email,
                COALESCE(sp.fullName, u.email) as userName
            FROM event_registrations er
            JOIN users u ON er.userId = u.id
            LEFT JOIN student_profiles sp ON u.id = sp.userId
            WHERE er.eventId = ?
            ORDER BY er.registeredAt DESC
        `, [eventId])
        return registrations
    } catch (error) {
        console.error('Get event registrations error:', error)
        return []
    }
}

// Staff record who actually attended, once the event has started.
export async function setAttendance(registrationId: string, attended: boolean) {
    const auth = await requireStaff()
    if ('error' in auth) return { error: auth.error }

    const rows = await query<RowDataPacket[]>(
        `SELECT er.status, e.startDate FROM event_registrations er
         JOIN events e ON e.id = er.eventId WHERE er.id = ?`,
        [registrationId]
    )
    const reg = rows[0]
    if (!reg) return { error: 'Registration not found' }
    if (reg.status !== 'REGISTERED') return { error: 'Only active registrations can be marked' }
    if (nowInOman() < minute(reg.startDate)) return { error: 'Attendance can be recorded once the event starts' }

    await query('UPDATE event_registrations SET attended = ? WHERE id = ?', [attended, registrationId])
    revalidatePath('/admin/events')
    revalidatePath('/student')
    return { success: true }
}
