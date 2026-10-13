import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { redirect } from 'next/navigation'
import { RowDataPacket } from '@/lib/types'
import { AdminRoleProvider } from '@/components/AdminRoleContext'
import TableLabels from '@/components/TableLabels'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    if (!session.isLoggedIn) {
        redirect('/login')
    }

    // Re-check the role in the database so a stale cookie can't keep access after a role change.
    // Per-section limits for STAFF are enforced in middleware and on the admin-only pages.
    const users = await query<RowDataPacket[]>('SELECT role FROM users WHERE id = ?', [session.userId])
    const role = users[0]?.role

    if (role !== 'ADMIN' && role !== 'STAFF') {
        redirect('/')
    }

    return (
        <AdminRoleProvider role={role}>
            <div id="admin-root" style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', minWidth: 0 }}>
                {children}
            </div>
            <TableLabels rootId="admin-root" />
        </AdminRoleProvider>
    )
}
