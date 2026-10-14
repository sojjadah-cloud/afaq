import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import { initials } from '@/lib/utils'
import Link from 'next/link'
import styles from './Header.module.css'
import LogoutButton from './LogoutButton'
import SearchBar from './SearchBar'
import NotificationBell from './NotificationBell'
import LanguageSwitch from './LanguageSwitch'
import { getT } from '@/i18n/server'

const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrator',
    STAFF: 'Staff',
    STUDENT: 'Student',
}

export default async function Header() {
    const session = await getSession()
    const { t } = await getT()

    let displayName = t('Guest')
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
    const roleLabel = t(ROLE_LABELS[session.role] || 'Member')

    return (
        <header className={styles.header}>
            <h1>
                <Link href="/" className={styles.brand}>
                    {t('AFAQ Innovation Portal')}<span className={styles.titleSuffix}> – {t('Military Technological College')}</span>
                </Link>
            </h1>
            <div className={styles.headerCenter}>
                <SearchBar />
            </div>
            <div className={styles.headerActions}>
                <LanguageSwitch className={styles.langBtn} />
                {session.isLoggedIn && <NotificationBell />}
                {session.role === 'ADMIN' && (
                    <Link href="/admin" className={styles.adminLink} aria-label={t('Admin Panel')}>
                        <i className="fa-solid fa-shield-halved" aria-hidden="true"></i> <span className={styles.linkText}>{t('Admin Panel')}</span>
                    </Link>
                )}
                {session.role === 'STAFF' && (
                    <Link href="/staff" className={styles.adminLink} aria-label={t('Staff Panel')}>
                        <i className="fa-solid fa-clipboard-check" aria-hidden="true"></i> <span className={styles.linkText}>{t('Staff Panel')}</span>
                    </Link>
                )}
                {session.isLoggedIn ? (
                    <>
                        <Link href="/student" className={styles.userBox} title={t('My dashboard')} aria-label={t('My dashboard: {name}', { name: displayName })}>
                            <span className={styles.userText}>
                                <span className={styles.userName}>{displayName}</span>
                                <span className={styles.userRole}>{roleLabel}</span>
                            </span>
                            <div className={styles.avatar}>{avatar}</div>
                        </Link>
                        <LogoutButton />
                    </>
                ) : (
                    <Link href="/login" className={styles.adminLink}><i className="fa-solid fa-right-to-bracket" aria-hidden="true"></i> <span className={styles.linkText}>{t('Log In')}</span></Link>
                )}
            </div>
        </header>
    )
}
