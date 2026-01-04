'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { RowDataPacket } from 'mysql2'

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
            p.id,
            `"${(p.title || '').replace(/"/g, '""')}"`,
            p.category || '',
            p.status || '',
            p.progress || 0,
            `"${(p.createdBy || '').replace(/"/g, '""')}"`,
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
            b.id,
            `"${(b.labName || '').replace(/"/g, '""')}"`,
            b.bookingDate ? new Date(b.bookingDate).toISOString().split('T')[0] : '',
            b.timeSlot || '',
            b.status || '',
            `"${(b.purpose || '').replace(/"/g, '""')}"`,
            `"${(b.bookedBy || '').replace(/"/g, '""')}"`,
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
            u.id,
            u.militaryId || '',
            u.email || '',
            u.role || '',
            `"${(u.fullName || '').replace(/"/g, '""')}"`,
            `"${(u.department || '').replace(/"/g, '""')}"`,
            u.createdAt ? new Date(u.createdAt).toISOString() : ''
        ])

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        return { success: true, csv, filename: `users_${Date.now()}.csv` }
    } catch (error) {
        console.error('Export users error:', error)
        return { error: 'Failed to export users' }
    }
}
