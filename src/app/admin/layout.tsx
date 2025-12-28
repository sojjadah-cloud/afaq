import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { redirect } from 'next/navigation'
import { RowDataPacket } from 'mysql2'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    if (!session.isLoggedIn) {
        redirect('/login')
    }

    // Double-check role against database for immediate security
    // This ensures even if the cookie is valid, if the DB role changed, access is denied.
    const users = await query<RowDataPacket[]>('SELECT role FROM users WHERE id = ?', [session.userId])
    const user = users[0]

    if (!user || (user.role !== 'ADMIN')) {
        redirect('/')
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
            {children}
        </div>
    )
}
