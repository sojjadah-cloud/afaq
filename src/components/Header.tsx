import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import { initials } from '@/lib/utils'
import Link from 'next/link'
import styles from './Header.module.css'
import LogoutButton from './LogoutButton'
import RoleQuickLogin from './RoleQuickLogin'
import SearchBar from './SearchBar'
import NotificationBell from './NotificationBell'

const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrator',
    STAFF: 'Staff',
    STUDENT: 'Student',
}

export default async function Header() {
    const session = await getSession()

    let displayName = 'Guest'
    let avatar = 'GU'
    if (session.isLoggedIn) {
        let fullName = ''
        try {
            const rows = await query<RowDataPacket[]>('SELECT fullName FROM student_profiles WHERE userId = ?', [session.userId])
            fullName = (rows[0]?.fullName || '').trim()
        } catch { /* fall back to military ID */ }
        displayName = fullName || session.militaryId
        avatar = initials(fullName, session.militaryId.slice(-2).toUpperCase())
    }
    const roleLabel = ROLE_LABELS[session.role] || 'Member'

    return (
        <header className={styles.header}>
            <h1>
                <Link href="/" className={styles.brand}>
                    AFAQ Innovation Portal<span className={styles.titleSuffix}> – Military Technological College</span>
                </Link>
            </h1>
            <div className={styles.headerCenter}>
                <SearchBar />
            </div>
            <div className={styles.headerActions}>
                {session.isLoggedIn && <NotificationBell />}
                {session.role === 'ADMIN' && (
                    <Link href="/admin" className={styles.adminLink} aria-label="Admin Panel">
                        <i className="fa-solid fa-shield-halved"></i> <span className={styles.linkText}>Admin Panel</span>
                    </Link>
                )}
                {session.role === 'STAFF' && (
                    <Link href="/staff" className={styles.adminLink} aria-label="Staff Panel">
                        <i className="fa-solid fa-clipboard-check"></i> <span className={styles.linkText}>Staff Panel</span>
                    </Link>
                )}
                {session.isLoggedIn ? (
                    <>
                        <Link href="/student" className={styles.userBox} title="My profile" aria-label={`My profile: ${displayName}`}>
                            <span className={styles.userText}>
                                <span className={styles.userName}>{displayName}</span>
                                <span className={styles.userRole}>{roleLabel}</span>
                            </span>
                            <div className={styles.avatar}>{avatar}</div>
                        </Link>
                        <LogoutButton />
                    </>
                ) : (
                    <RoleQuickLogin />
                )}
            </div>
        </header>
    )
}
