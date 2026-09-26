import { getSession } from '@/lib/auth'
import Link from 'next/link'
import styles from './Header.module.css'
import LogoutButton from './LogoutButton'
import RoleQuickLogin from './RoleQuickLogin'
import SearchBar from './SearchBar'
import NotificationBell from './NotificationBell'

export default async function Header() {
    const session = await getSession()
    const displayName = session.isLoggedIn
        ? `Student ${session.militaryId}`
        : 'Guest'
    const initials = session.isLoggedIn
        ? session.militaryId.slice(-2).toUpperCase()
        : 'GU'

    return (
        <header className={styles.header}>
            <h1>AFAQ Innovation Portal – Military Technological College</h1>
            <div className={styles.headerCenter}>
                <SearchBar />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {session.isLoggedIn && <NotificationBell />}
                {session.role === 'ADMIN' && (
                    <Link href="/admin" className={styles.adminLink}>
                        <i className="fa-solid fa-shield-halved"></i> Admin Panel
                    </Link>
                )}
                {session.isLoggedIn ? (
                    <>
                        <Link href="/student" className={styles.userBox}>
                            <span>{displayName}</span>
                            <div className={styles.avatar}>{initials}</div>
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
