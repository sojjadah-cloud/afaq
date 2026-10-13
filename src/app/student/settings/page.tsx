import Link from 'next/link'
import { redirect } from 'next/navigation'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { RowDataPacket } from '@/lib/types'
import SettingsClient from './SettingsClient'
import styles from './settings.module.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Account Settings' }

export default async function SettingsPage() {
    const session = await getSession()
    if (!session.isLoggedIn) redirect('/login')

    const rows = await query<RowDataPacket[]>(
        `SELECT u.militaryId, u.email, u.role, sp.fullName, sp.phone, sp.bio, sp.departmentId, sp.programmeId, sp.yearLevel
         FROM users u LEFT JOIN student_profiles sp ON sp.userId = u.id WHERE u.id = ?`,
        [session.userId]
    )
    const me = rows[0]
    if (!me) redirect('/login')

    const departments = await query<RowDataPacket[]>('SELECT id, name FROM departments ORDER BY name')
    const programmes = await query<RowDataPacket[]>('SELECT id, name, departmentId FROM programmes ORDER BY name')

    return (
        <main className={styles.main}>
            <Link href="/student" className={styles.backLink}>
                <i className="fa-solid fa-arrow-left"></i> Back to my profile
            </Link>
            <div className={styles.header}>
                <h2>Account Settings</h2>
                <p>Update your personal details and password.</p>
            </div>
            <SettingsClient
                profile={{
                    fullName: me.fullName || '',
                    phone: me.phone || '',
                    bio: me.bio || '',
                    departmentId: me.departmentId || '',
                    programmeId: me.programmeId || '',
                    yearLevel: me.yearLevel || '',
                    militaryId: me.militaryId,
                    email: me.email,
                    role: me.role,
                }}
                departments={departments.map(d => ({ id: String(d.id), name: String(d.name) }))}
                programmes={programmes.map(p => ({ id: String(p.id), name: String(p.name), departmentId: String(p.departmentId) }))}
            />
        </main>
    )
}
