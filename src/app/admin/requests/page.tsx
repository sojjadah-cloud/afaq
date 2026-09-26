import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getClubRegistrations } from '@/actions/club'
import { getContactMessages } from '@/actions/contact'
import RequestsClient from './RequestsClient'

export const dynamic = 'force-dynamic'

export default async function AdminRequestsPage() {
    const session = await getSession()

    if (!session.isLoggedIn || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
        redirect('/login')
    }

    const registrations = await getClubRegistrations()
    const contactMessages = await getContactMessages()

    return (
        <RequestsClient
            initialRegistrations={registrations}
            initialMessages={contactMessages}
        />
    )
}
