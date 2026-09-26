'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function approveBooking(bookingId: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }
    if (session.role !== 'STAFF' && session.role !== 'ADMIN') {
        return { error: 'Not authorized' }
    }

    try {
        await query(
            'UPDATE lab_bookings SET status = \'APPROVED\', updatedAt = NOW() WHERE id = ?',
            [bookingId]
        )
        revalidatePath('/admin')
        revalidatePath('/admin/bookings')
        return { success: true }
    } catch (error) {
        console.error('Approve booking error:', error)
        return { error: 'Failed to approve booking' }
    }
}

export async function rejectBooking(bookingId: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }
    if (session.role !== 'STAFF' && session.role !== 'ADMIN') {
        return { error: 'Not authorized' }
    }

    try {
        await query(
            'UPDATE lab_bookings SET status = \'REJECTED\', updatedAt = NOW() WHERE id = ?',
            [bookingId]
        )
        revalidatePath('/admin')
        revalidatePath('/admin/bookings')
        return { success: true }
    } catch (error) {
        console.error('Reject booking error:', error)
        return { error: 'Failed to reject booking' }
    }
}

export async function cancelBooking(bookingId: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }

    // Check if user owns the booking or is admin/staff
    const booking = await query<any[]>(
        'SELECT userId FROM lab_bookings WHERE id = ?',
        [bookingId]
    )

    if (!booking[0]) return { error: 'Booking not found' }

    if (booking[0].userId !== session.userId && session.role !== 'ADMIN' && session.role !== 'STAFF') {
        return { error: 'Not authorized' }
    }

    try {
        await query(
            'UPDATE lab_bookings SET status = \'CANCELLED\', updatedAt = NOW() WHERE id = ?',
            [bookingId]
        )
        revalidatePath('/lab-booking')
        revalidatePath('/admin/bookings')
        return { success: true }
    } catch (error) {
        console.error('Cancel booking error:', error)
        return { error: 'Failed to cancel booking' }
    }
}

export async function completeBooking(bookingId: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }
    if (session.role !== 'STAFF' && session.role !== 'ADMIN') {
        return { error: 'Not authorized' }
    }

    try {
        await query(
            'UPDATE lab_bookings SET status = \'COMPLETED\', updatedAt = NOW() WHERE id = ?',
            [bookingId]
        )
        revalidatePath('/admin/bookings')
        return { success: true }
    } catch (error) {
        console.error('Complete booking error:', error)
        return { error: 'Failed to complete booking' }
    }
}
