import { query } from '@/lib/db'
import { RowDataPacket } from 'mysql2'
import { getSession } from '@/lib/auth'
import EventsClient from './EventsClient'

interface Event extends RowDataPacket {
    id: string
    title: string
    description: string
    category: string
    startDate: Date
    endDate: Date
    location: string
    registrationCount: number
}

export default async function EventsPage() {
    const session = await getSession()

    const events = await query<Event[]>(`
        SELECT
            e.*,
            (SELECT COUNT(*) FROM event_registrations er WHERE er.eventId = e.id) as registrationCount
        FROM events e
        ORDER BY e.startDate ASC
    `)

    const canCreate = session.isLoggedIn && (session.role === 'STAFF' || session.role === 'ADMIN')

    return <EventsClient events={events} canCreate={canCreate} />
}
