import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import { todayInOman } from '@/lib/utils'
import BookingsClient from './BookingsClient'
import { pageTitle } from '@/lib/metadata'

export const generateMetadata = () => pageTitle('Booking Management')

export const dynamic = 'force-dynamic'

interface Booking extends RowDataPacket {
    id: string
    labName: string
    categoryKey: string
    userName: string
    militaryId: string
    bookingDate: string
    returnDate: string | null
    returnNote: string | null
    timeSlot: string
    purpose: string
    status: string
}

export default async function BookingsPage() {
    const bookings = await query<Booking[]>(`
        SELECT 
            b.*,
            l.name as labName,
            c.key as categoryKey,
            COALESCE(sp.fullName, u.email) as userName,
            u.militaryId
        FROM lab_bookings b
        JOIN labs l ON b.labId = l.id
        JOIN lab_categories c ON c.id = l.categoryId
        JOIN users u ON b.userId = u.id
        LEFT JOIN student_profiles sp ON u.id = sp.userId
        ORDER BY b.createdAt DESC
    `)

    const rows = bookings.map(b => ({
        id: String(b.id), labName: b.labName, userName: b.userName, militaryId: b.militaryId,
        isBorrow: b.categoryKey === 'toolBorrowing', bookingDate: String(b.bookingDate).slice(0, 10),
        returnDate: b.returnDate ? String(b.returnDate) : '', returnNote: b.returnNote || '',
        timeSlot: b.timeSlot, purpose: b.purpose, status: b.status,
    }))

    return <BookingsClient initialBookings={rows} today={todayInOman()} />
}
