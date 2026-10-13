'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { RowDataPacket } from '@/lib/types'
import { createNotification } from '@/lib/notify'
import { todayInOman } from '@/lib/utils'
import { randomBytes } from 'crypto'

const TIME_SLOTS = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00']
const MAX_BORROW_DAYS = 14
const ACTIVE = "('PENDING', 'APPROVED')"

function addDays(date: string, days: number) {
    const d = new Date(`${date}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + days)
    return d.toISOString().slice(0, 10)
}

// Units of a borrowable item already reserved on any day of [from, to].
async function unitsReserved(labId: string, from: string, to: string) {
    const rows = await query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM lab_bookings
         WHERE labId = ? AND status IN ${ACTIVE}
           AND substr(bookingDate, 1, 10) <= ? AND COALESCE(returnDate, substr(bookingDate, 1, 10)) >= ?`,
        [labId, to, from]
    )
    return Number(rows[0]?.count) || 0
}

// What the booking form needs to show for a given date.
export async function getAvailability(labId: string, date: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return { takenSlots: [] as string[], unitsLeft: 0 }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { takenSlots: [] as string[], unitsLeft: 0 }

    const lab = await query<RowDataPacket[]>(
        'SELECT l.capacity, c.key FROM labs l JOIN lab_categories c ON c.id = l.categoryId WHERE l.id = ?',
        [labId]
    )
    if (!lab[0]) return { takenSlots: [] as string[], unitsLeft: 0 }

    if (lab[0].key === 'toolBorrowing') {
        const used = await unitsReserved(labId, date, date)
        return { takenSlots: [] as string[], unitsLeft: Math.max(0, Number(lab[0].capacity) - used) }
    }
    const rows = await query<RowDataPacket[]>(
        `SELECT timeSlot FROM lab_bookings WHERE labId = ? AND substr(bookingDate, 1, 10) = ? AND status IN ${ACTIVE}`,
        [labId, date]
    )
    return { takenSlots: rows.map(r => String(r.timeSlot)), unitsLeft: 0 }
}

export async function createBooking(formData: FormData) {
    const session = await getSession()
    if (!session.isLoggedIn) {
        return { error: 'You must be logged in to book' }
    }

    const labId = String(formData.get('labId') || '')
    const date = String(formData.get('date') || '')
    const timeSlot = String(formData.get('timeSlot') || '')
    const purpose = String(formData.get('purpose') || '').trim()
    const returnDate = String(formData.get('returnDate') || '')

    if (!labId || !date || !timeSlot || !purpose) {
        return { error: 'All fields are required' }
    }
    if (purpose.length > 500) {
        return { error: 'Keep the purpose under 500 characters' }
    }
    if (!TIME_SLOTS.includes(timeSlot)) {
        return { error: 'Please choose a valid time slot' }
    }
    const today = todayInOman()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today) {
        return { error: 'Please choose today or a future date' }
    }

    try {
        const labs = await query<RowDataPacket[]>(
            'SELECT l.isBookable, l.capacity, c.key FROM labs l JOIN lab_categories c ON c.id = l.categoryId WHERE l.id = ?',
            [labId]
        )
        const lab = labs[0]
        if (!lab || !lab.isBookable) {
            return { error: 'This item is not available for booking' }
        }

        const duplicate = await query<RowDataPacket[]>(
            `SELECT id FROM lab_bookings WHERE labId = ? AND userId = ? AND substr(bookingDate, 1, 10) = ? AND timeSlot = ? AND status IN ${ACTIVE}`,
            [labId, session.userId, date, timeSlot]
        )
        if (duplicate.length) {
            return { error: 'You already have a request for this item at that time' }
        }

        const isBorrow = lab.key === 'toolBorrowing'
        if (isBorrow) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(returnDate) || returnDate < date) {
                return { error: 'Choose a return date on or after the pickup date' }
            }
            if (returnDate > addDays(date, MAX_BORROW_DAYS)) {
                return { error: `Items can be borrowed for up to ${MAX_BORROW_DAYS} days` }
            }
            const used = await unitsReserved(labId, date, returnDate)
            if (used >= Number(lab.capacity)) {
                return { error: 'All units are already reserved for those dates. Try different dates.' }
            }
        } else {
            const existing = await query<RowDataPacket[]>(
                `SELECT id FROM lab_bookings WHERE labId = ? AND substr(bookingDate, 1, 10) = ? AND timeSlot = ? AND status IN ${ACTIVE}`,
                [labId, date, timeSlot]
            )
            if (existing.length > 0) {
                return { error: 'This slot is already booked. Choose another time.' }
            }
        }

        await query(
            `INSERT INTO lab_bookings (id, userId, labId, bookingDate, timeSlot, status, purpose, returnDate, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?, NOW(), NOW())`,
            [`booking_${Date.now()}_${randomBytes(3).toString('hex')}`, session.userId, labId, date, timeSlot, purpose, isBorrow ? returnDate : null]
        )

        revalidatePath('/student')
        revalidatePath('/admin/bookings')
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
