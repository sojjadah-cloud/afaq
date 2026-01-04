import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getEvents } from '@/actions/events'
import EventsManagementClient from './EventsManagementClient'

export default async function AdminEventsPage() {
    const session = await getSession()

    if (!session.isLoggedIn || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
        redirect('/login')
    }

    const events = await getEvents()

    return <EventsManagementClient events={events} />
}
