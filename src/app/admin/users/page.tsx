import { redirect } from 'next/navigation'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { RowDataPacket } from '@/lib/types'
import AdminNav from '@/components/AdminNav'
import styles from '../admin.module.css'
import UsersClient, { AdminUserRow } from './UsersClient'

export const metadata = { title: 'User Management' }

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
    const session = await getSession()
    if (session.role !== 'ADMIN') redirect('/staff')

    const rows = await query<RowDataPacket[]>(`
        SELECT u.id, u.militaryId, u.email, u.role, u.isActive, u.createdAt,
               sp.fullName, d.name as department
        FROM users u
        LEFT JOIN student_profiles sp ON sp.userId = u.id
        LEFT JOIN departments d ON d.id = sp.departmentId
        ORDER BY u.createdAt DESC
    `)
    const departments = await query<RowDataPacket[]>('SELECT id, name FROM departments ORDER BY name')
    const programmes = await query<RowDataPacket[]>('SELECT id, name, departmentId FROM programmes ORDER BY name')

    const users: AdminUserRow[] = rows.map(r => ({
        id: r.id,
        militaryId: r.militaryId,
        email: r.email,
        role: r.role,
        isActive: Boolean(r.isActive),
        createdAt: String(r.createdAt),
        fullName: r.fullName || '',
        department: r.department || '',
    }))

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>Users</h2>
                <p>Accounts, roles and access</p>
            </div>
            <AdminNav />
            <UsersClient
                users={users}
                currentUserId={session.userId}
                departments={departments.map(d => ({ id: String(d.id), name: String(d.name) }))}
                programmes={programmes.map(p => ({ id: String(p.id), name: String(p.name), departmentId: String(p.departmentId) }))}
            />
        </main>
    )
}
