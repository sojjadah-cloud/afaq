import { query } from '@/lib/db'
import { RowDataPacket } from 'mysql2'
import BookingsClient from './BookingsClient'

export const dynamic = 'force-dynamic'

interface Booking extends RowDataPacket {
    id: string
    labId: string
    labName: string
    userId: string
    userName: string
    militaryId: string
    bookingDate: Date
    timeSlot: string
    purpose: string
    status: string
    createdAt: Date
}

export default async function BookingsPage() {
    const bookings = await query<Booking[]>(`
        SELECT 
            b.*,
            l.name as labName,
            COALESCE(sp.fullName, u.email) as userName,
            u.militaryId
        FROM lab_bookings b
        JOIN labs l ON b.labId = l.id
        JOIN users u ON b.userId = u.id
        LEFT JOIN student_profiles sp ON u.id = sp.userId
        ORDER BY b.createdAt DESC
    `)

    return <BookingsClient initialBookings={bookings} />
}
