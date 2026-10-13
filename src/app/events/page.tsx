import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import { getSession } from '@/lib/auth'
import EventsClient from './EventsClient'
import { CalendarEventItem } from './EventCalendar'
import { todayInOman } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
    const session = await getSession()

    const rows = await query<RowDataPacket[]>(`
        SELECT
            e.id, e.title, e.description, e.category, e.eventType, e.startDate, e.endDate, e.location,
            (SELECT COUNT(*) FROM event_registrations er WHERE er.eventId = e.id AND er.status = 'REGISTERED') as registrationCount
        FROM events e
        ORDER BY e.startDate ASC
    `)
    const events: CalendarEventItem[] = rows.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description || '',
        category: r.category || 'General',
        eventType: r.eventType,
        startDate: String(r.startDate),
        endDate: r.endDate ? String(r.endDate) : null,
        location: r.location,
        registrationCount: Number(r.registrationCount) || 0,
    }))

    // "Today" in Oman, so the calendar highlights the right day whatever the server's time zone.
    const today = todayInOman()
    const canCreate = session.isLoggedIn && (session.role === 'STAFF' || session.role === 'ADMIN')

    return <EventsClient events={events} canCreate={canCreate} today={today} />
}
