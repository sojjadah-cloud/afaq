'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { RowDataPacket } from '@/lib/types'

// Quotes every CSV field and neutralizes leading =, +, -, @ (and tab/CR) so a
// spreadsheet app never interprets a user-supplied value as a formula.
function csvField(value: unknown): string {
    let str = value === null || value === undefined ? '' : String(value)
    if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`
    }
    return `"${str.replace(/"/g, '""')}"`
}

export async function exportProjectsCSV() {
    const session = await getSession()
    if (!session.isLoggedIn || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
        return { error: 'Not authorized' }
    }

    try {
        const projects = await query<RowDataPacket[]>(`
            SELECT 
                p.id, p.title, p.category, p.status, p.progress,
                COALESCE(sp.fullName, u.email) as createdBy,
                p.createdAt, p.updatedAt
            FROM projects p
            LEFT JOIN users u ON p.createdById = u.id
            LEFT JOIN student_profiles sp ON u.id = sp.userId
            ORDER BY p.createdAt DESC
        `)

        // Generate CSV
        const headers = ['ID', 'Title', 'Category', 'Status', 'Progress', 'Created By', 'Created At', 'Updated At']
        const rows = projects.map(p => [
            csvField(p.id),
            csvField(p.title),
            csvField(p.category),
            csvField(p.status),
            p.progress || 0,
            csvField(p.createdBy),
            p.createdAt ? new Date(p.createdAt).toISOString() : '',
            p.updatedAt ? new Date(p.updatedAt).toISOString() : ''
        ])

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        return { success: true, csv, filename: `projects_${Date.now()}.csv` }
    } catch (error) {
        console.error('Export projects error:', error)
        return { error: 'Failed to export projects' }
    }
}

export async function exportBookingsCSV() {
    const session = await getSession()
    if (!session.isLoggedIn || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
        return { error: 'Not authorized' }
    }

    try {
        const bookings = await query<RowDataPacket[]>(`
            SELECT 
                b.id, l.name as labName, b.bookingDate, b.timeSlot, b.status, b.purpose,
                COALESCE(sp.fullName, u.email) as bookedBy,
                b.createdAt
            FROM lab_bookings b
            JOIN labs l ON b.labId = l.id
            JOIN users u ON b.userId = u.id
            LEFT JOIN student_profiles sp ON u.id = sp.userId
            ORDER BY b.bookingDate DESC
        `)

        const headers = ['ID', 'Lab', 'Date', 'Time Slot', 'Status', 'Purpose', 'Booked By', 'Created At']
        const rows = bookings.map(b => [
            csvField(b.id),
            csvField(b.labName),
            b.bookingDate ? new Date(b.bookingDate).toISOString().split('T')[0] : '',
            csvField(b.timeSlot),
            csvField(b.status),
            csvField(b.purpose),
            csvField(b.bookedBy),
            b.createdAt ? new Date(b.createdAt).toISOString() : ''
        ])

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        return { success: true, csv, filename: `bookings_${Date.now()}.csv` }
    } catch (error) {
        console.error('Export bookings error:', error)
        return { error: 'Failed to export bookings' }
    }
}

export async function exportUsersCSV() {
    const session = await getSession()
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
        return { error: 'Not authorized' }
    }

    try {
        const users = await query<RowDataPacket[]>(`
            SELECT 
                u.id, u.militaryId, u.email, u.role,
                COALESCE(sp.fullName, '') as fullName,
                d.name as department,
                u.createdAt
            FROM users u
            LEFT JOIN student_profiles sp ON u.id = sp.userId
            LEFT JOIN departments d ON sp.departmentId = d.id
            ORDER BY u.createdAt DESC
        `)

        const headers = ['ID', 'Military ID', 'Email', 'Role', 'Full Name', 'Department', 'Created At']
        const rows = users.map(u => [
            csvField(u.id),
            csvField(u.militaryId),
            csvField(u.email),
            csvField(u.role),
            csvField(u.fullName),
            csvField(u.department),
            u.createdAt ? new Date(u.createdAt).toISOString() : ''
        ])

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        return { success: true, csv, filename: `users_${Date.now()}.csv` }
    } catch (error) {
        console.error('Export users error:', error)
        return { error: 'Failed to export users' }
    }
}

export async function exportClubRegistrationsCSV() {
    const session = await getSession()
    if (!session.isLoggedIn || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
        return { error: 'Not authorized' }
    }

    try {
        const registrations = await query<RowDataPacket[]>(`
            SELECT * FROM club_registrations
            ORDER BY createdAt DESC
        `)

        const headers = ['ID', 'Full Name', 'Military ID', 'Email', 'Phone', 'Department', 'Year Level', 'Interests', 'Motivation', 'Status', 'Created At']
        const rows = registrations.map(r => [
            csvField(r.id),
            csvField(r.fullName),
            csvField(r.militaryId),
            csvField(r.email),
            csvField(r.phone),
            csvField(r.department),
            csvField(r.yearLevel),
            csvField(r.interests),
            csvField((r.motivation || '').substring(0, 200)),
            csvField(r.status),
            r.createdAt ? new Date(r.createdAt).toISOString() : ''
        ])

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        return { success: true, csv, filename: `club_registrations_${Date.now()}.csv` }
    } catch (error) {
        console.error('Export registrations error:', error)
        return { error: 'Failed to export registrations' }
    }
}

export async function exportContactMessagesCSV() {
    const session = await getSession()
    if (!session.isLoggedIn || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
        return { error: 'Not authorized' }
    }

    try {
        const messages = await query<RowDataPacket[]>(`
            SELECT * FROM contact_messages
            ORDER BY createdAt DESC
        `)

        const headers = ['ID', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Created At']
        const rows = messages.map(m => [
            csvField(m.id),
            csvField(m.name),
            csvField(m.email),
            csvField(m.phone),
            csvField(m.subject),
            csvField((m.message || '').substring(0, 200)),
            csvField(m.status),
            m.createdAt ? new Date(m.createdAt).toISOString() : ''
        ])

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        return { success: true, csv, filename: `contact_messages_${Date.now()}.csv` }
    } catch (error) {
        console.error('Export messages error:', error)
        return { error: 'Failed to export messages' }
    }
}

export async function exportEventsCSV() {
    const session = await getSession()
    if (!session.isLoggedIn || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
        return { error: 'Not authorized' }
    }

    try {
        const events = await query<RowDataPacket[]>(`
            SELECT 
                e.*,
                (SELECT COUNT(*) FROM event_registrations er WHERE er.eventId = e.id AND er.status = 'REGISTERED') as registrationCount
            FROM events e
            ORDER BY e.startDate DESC
        `)

        const headers = ['ID', 'Title', 'Category', 'Start Date', 'End Date', 'Location', 'Capacity', 'Registrations', 'Created At']
        const rows = events.map(e => [
            csvField(e.id),
            csvField(e.title),
            csvField(e.category),
            e.startDate ? new Date(e.startDate).toISOString() : '',
            e.endDate ? new Date(e.endDate).toISOString() : '',
            csvField(e.location),
            e.capacity || 'Unlimited',
            e.registrationCount || 0,
            e.createdAt ? new Date(e.createdAt).toISOString() : ''
        ])

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        return { success: true, csv, filename: `events_${Date.now()}.csv` }
    } catch (error) {
        console.error('Export events error:', error)
        return { error: 'Failed to export events' }
    }
}

export async function exportEventRegistrationsCSV(eventId: string, eventTitle: string) {
    const session = await getSession()
    if (!session.isLoggedIn || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
        return { error: 'Not authorized' }
    }

    try {
        const registrations = await query<RowDataPacket[]>(`
            SELECT 
                er.id, er.status, er.registeredAt,
                u.militaryId, u.email,
                COALESCE(sp.fullName, u.email) as userName,
                d.name as department
            FROM event_registrations er
            JOIN users u ON er.userId = u.id
            LEFT JOIN student_profiles sp ON u.id = sp.userId
            LEFT JOIN departments d ON sp.departmentId = d.id
            WHERE er.eventId = ?
            ORDER BY er.registeredAt DESC
        `, [eventId])

        const headers = ['Name', 'Military ID', 'Email', 'Department', 'Status', 'Registered At']
        const rows = registrations.map(r => [
            csvField(r.userName),
            csvField(r.militaryId),
            csvField(r.email),
            csvField(r.department || 'N/A'),
            csvField(r.status),
            r.registeredAt ? new Date(r.registeredAt).toISOString() : ''
        ])

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const safeTitle = eventTitle.replace(/[^a-z0-9]/gi, '_').substring(0, 30)
        return { success: true, csv, filename: `event_registrations_${safeTitle}_${Date.now()}.csv` }
    } catch (error) {
        console.error('Export event registrations error:', error)
        return { error: 'Failed to export registrations' }
    }
}


