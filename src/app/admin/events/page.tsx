import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getEvents } from '@/actions/events'
import { nowInOman } from '@/lib/utils'
import EventsManagementClient from './EventsManagementClient'
import { pageTitle } from '@/lib/metadata'

export const generateMetadata = () => pageTitle('Events Management')

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
    const session = await getSession()

    if (!session.isLoggedIn || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
        redirect('/login')
    }

    const events = await getEvents() as any[]

    return <EventsManagementClient events={events} now={nowInOman()} />
}
