'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { RowDataPacket } from '@/lib/types'

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

    try {
        // Check availability
        const existing = await query<RowDataPacket[]>('SELECT * FROM lab_bookings WHERE labId = ? AND bookingDate = ? AND timeSlot = ?', [labId, date, timeSlot])

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
