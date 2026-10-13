'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { getActiveUser } from '@/lib/session'
import { createNotification } from '@/lib/notify'
import { revalidatePath } from 'next/cache'
import { RowDataPacket } from '@/lib/types'

type Status = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'

// Which states a booking may move to from its current state.
const TRANSITIONS: Record<string, Status[]> = {
    PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
    APPROVED: ['COMPLETED', 'CANCELLED'],
}

const MESSAGES: Partial<Record<Status, string>> = {
    APPROVED: 'approved',
    REJECTED: 'not approved',
    CANCELLED: 'cancelled by the club',
}

async function moveBooking(bookingId: string, to: Status, note?: string) {
    const user = await getActiveUser(await getSession())
    if (!user) return { error: 'Not authenticated' }
    if (user.role !== 'STAFF' && user.role !== 'ADMIN') return { error: 'Not authorized' }

    const rows = await query<RowDataPacket[]>(
        `SELECT b.status, b.userId, b.bookingDate, l.name as labName
         FROM lab_bookings b JOIN labs l ON l.id = b.labId WHERE b.id = ?`,
        [bookingId]
    )
    const booking = rows[0]
    if (!booking) return { error: 'Booking not found' }
    if (!(TRANSITIONS[booking.status] || []).includes(to)) {
        return { error: `A ${String(booking.status).toLowerCase()} booking cannot be changed to ${to.toLowerCase()}` }
    }

    try {
        if (to === 'COMPLETED') {
            await query(
                'UPDATE lab_bookings SET status = ?, returnNote = ?, updatedAt = NOW() WHERE id = ?',
                [to, note?.trim().slice(0, 500) || null, bookingId]
            )
        } else {
            await query('UPDATE lab_bookings SET status = ?, updatedAt = NOW() WHERE id = ?', [to, bookingId])
        }

        const word = MESSAGES[to]
        if (word && booking.userId !== user.id) {
            await createNotification(
                booking.userId,
                'BOOKING',
                `Booking ${word}: ${booking.labName}`,
                `Your request for ${String(booking.bookingDate).slice(0, 10)} was ${word}.`,
                '/student'
            )
        }

        revalidatePath('/admin')
        revalidatePath('/admin/bookings')
        revalidatePath('/student')
        return { success: true }
    } catch (error) {
        console.error('Update booking error:', error)
        return { error: 'Failed to update booking' }
    }
}

export async function approveBooking(bookingId: string) {
    return moveBooking(bookingId, 'APPROVED')
}

export async function rejectBooking(bookingId: string) {
    return moveBooking(bookingId, 'REJECTED')
}

export async function cancelBooking(bookingId: string) {
    return moveBooking(bookingId, 'CANCELLED')
}

// Marks a session as finished or a borrowed item as returned, with an optional condition note.
export async function completeBooking(bookingId: string, note?: string) {
    return moveBooking(bookingId, 'COMPLETED', note)
}
