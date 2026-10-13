'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { RowDataPacket } from '@/lib/types'
import { createNotification } from '@/lib/notify'
import { todayInOman } from '@/lib/utils'

export async function createBooking(formData: FormData) {
    const session = await getSession()
    if (!session.isLoggedIn) {
        return { error: 'You must be logged in to book a lab' }
    }

    const labId = formData.get('labId') as string
    const date = formData.get('date') as string
    const timeSlot = formData.get('timeSlot') as string
    const purpose = formData.get('purpose') as string

    if (!labId || !date || !timeSlot || !purpose) {
        return { error: 'All fields are required' }
    }
    if (!['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00'].includes(timeSlot)) {
        return { error: 'Please choose a valid time slot' }
    }
    const today = todayInOman()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today) {
        return { error: 'Please choose today or a future date' }
    }

    try {
        const lab = await query<RowDataPacket[]>('SELECT isBookable FROM labs WHERE id = ?', [labId])
        if (!lab[0] || !lab[0].isBookable) {
            return { error: 'This item is not available for booking' }
        }

        // Check availability
        const existing = await query<RowDataPacket[]>(
            `SELECT id FROM lab_bookings
             WHERE labId = ? AND substr(bookingDate, 1, 10) = ? AND timeSlot = ? AND status NOT IN ('CANCELLED', 'REJECTED')`,
            [labId, date, timeSlot]
        )

        if (existing.length > 0) {
            return { error: 'This slot is already booked' }
        }

        // Create booking
        await query(
            'INSERT INTO lab_bookings (id, userId, labId, bookingDate, timeSlot, status, purpose, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [`booking_${Date.now()}`, session.userId, labId, date, timeSlot, 'PENDING', purpose]
        )

        revalidatePath('/lab-booking')
        return { success: true }
    } catch (error) {
        console.error('Booking error:', error)
        return { error: 'Failed to create booking' }
    }
}

const SUPPORT_TYPES = ['Equipment training', 'Setup & configuration', 'Fault or repair', 'Supervision during use', 'Other']

export async function requestTechnician(formData: FormData) {
    const session = await getSession()
    if (!session.isLoggedIn) {
        return { error: 'You must be logged in to contact a technician' }
    }

    const resourceId = String(formData.get('resourceId') || '')
    const supportType = String(formData.get('supportType') || '')
    const preferredDate = String(formData.get('preferredDate') || '')
    const timeSlot = String(formData.get('timeSlot') || '')
    const details = String(formData.get('details') || '').trim()

    if (!resourceId || !SUPPORT_TYPES.includes(supportType) || !details) {
        return { error: 'Please choose the lab or tool, the type of support and describe what you need' }
    }
    if (details.length > 2000) {
        return { error: 'Please keep the details under 2000 characters' }
    }

    try {
        const resources = await query<RowDataPacket[]>(
            `SELECT l.name, c.label as category, c.technician
             FROM labs l JOIN lab_categories c ON c.id = l.categoryId WHERE l.id = ?`,
            [resourceId]
        )
        const resource = resources[0]
        if (!resource) return { error: 'Lab or tool not found' }

        const people = await query<RowDataPacket[]>(
            `SELECT u.email, sp.fullName, sp.phone FROM users u
             LEFT JOIN student_profiles sp ON sp.userId = u.id WHERE u.id = ?`,
            [session.userId]
        )
        const me = people[0] || {}

        const message = [
            `Resource: ${resource.name} (${resource.category})`,
            `Support needed: ${supportType}`,
            `Preferred time: ${preferredDate || 'Flexible'}${timeSlot ? `, ${timeSlot}` : ''}`,
            resource.technician ? `Technician: ${resource.technician}` : '',
            '',
            details,
        ].filter((line, i) => line !== '' || i === 4).join('\n')

        await query(
            `INSERT INTO contact_messages (id, name, email, phone, subject, message, status, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, 'Technician Coordination', ?, 'NEW', NOW(), NOW())`,
            [`contact_${Date.now()}`, me.fullName || session.militaryId, me.email || session.email, me.phone || null, message]
        )

        const staff = await query<RowDataPacket[]>("SELECT id FROM users WHERE role IN ('STAFF', 'ADMIN')")
        for (const s of staff) {
            await createNotification(
                s.id, 'TECHNICIAN_REQUEST', 'Technician Request',
                `${me.fullName || session.militaryId} needs ${supportType.toLowerCase()} for ${resource.name}.`,
                '/admin/requests'
            )
        }

        revalidatePath('/admin/requests')
        return { success: true }
    } catch (error) {
        console.error('Technician request error:', error)
        return { error: 'Failed to send the request. Please try again.' }
    }
}
