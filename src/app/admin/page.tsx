import { query } from '@/lib/db'
import styles from './admin.module.css'
import { RowDataPacket } from '@/lib/types'
import Link from 'next/link'
import AdminNav from '@/components/AdminNav'

export const dynamic = 'force-dynamic'

interface CountResult extends RowDataPacket {
    count: number
}

export default async function AdminDashboard() {
    // Core stats
    const userCount = await query<CountResult[]>('SELECT COUNT(*) as count FROM users')
    const projectCount = await query<CountResult[]>('SELECT COUNT(*) as count FROM projects')
    const bookingCount = await query<CountResult[]>('SELECT COUNT(*) as count FROM lab_bookings')
    const eventCount = await query<CountResult[]>('SELECT COUNT(*) as count FROM events')

    // Request stats
    let pendingRegistrations = 0
    let newMessages = 0
    let pendingBookings = 0
    let pendingProjects = 0

    try {
        const regCount = await query<CountResult[]>("SELECT COUNT(*) as count FROM club_registrations WHERE status = 'PENDING'")
        pendingRegistrations = regCount[0]?.count || 0
    } catch (e) { /* table may not exist */ }

    try {
        const msgCount = await query<CountResult[]>("SELECT COUNT(*) as count FROM contact_messages WHERE status = 'NEW'")
        newMessages = msgCount[0]?.count || 0
    } catch (e) { /* table may not exist */ }

    const pendingBookingCount = await query<CountResult[]>("SELECT COUNT(*) as count FROM lab_bookings WHERE status = 'PENDING'")
    pendingBookings = pendingBookingCount[0]?.count || 0

    try {
        const projCount = await query<CountResult[]>("SELECT COUNT(*) as count FROM projects WHERE status IN ('PENDING_APPROVAL', 'PENDING_COMPLETION')")
        pendingProjects = projCount[0]?.count || 0
    } catch (e) { /* status enum may not be updated yet */ }

    const controlItems = [
        {
            href: '/admin/bookings',
            icon: 'fa-calendar-check',
            title: 'Bookings',
            desc: 'Review and manage lab booking requests',
            badge: pendingBookings,
        },
        {
            href: '/admin/projects',
            icon: 'fa-lightbulb',
            title: 'Projects',
            desc: 'Approve, track and manage innovation projects',
            badge: pendingProjects,
        },
        {
            href: '/admin/requests',
            icon: 'fa-inbox',
            title: 'Requests',
            desc: 'Club registrations and contact messages',
            badge: pendingRegistrations + newMessages,
        },
        {
            href: '/admin/events',
            icon: 'fa-calendar-days',
            title: 'Events',
            desc: 'Create and manage club events',
            badge: 0,
        },
        {
            href: '/admin/analytics',
            icon: 'fa-chart-pie',
            title: 'Analytics',
            desc: 'Platform statistics and insights',
            badge: 0,
        },
        {
            href: '/admin/audit',
            icon: 'fa-clipboard-list',
            title: 'Audit Log',
            desc: 'Track every administrative action',
            badge: 0,
        },
    ]

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>Admin Control Panel</h2>
                <p>System Overview & Management</p>
            </div>

            <AdminNav />

            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.cardAnimate1}`}>
                    <div className={styles.statIcon}><i className="fa fa-users"></i></div>
                    <div className={styles.statValue}>{userCount[0].count}</div>
                    <div className={styles.statLabel}>Total Users</div>
                </div>
                <div className={`${styles.statCard} ${styles.cardAnimate2}`}>
                    <div className={styles.statIcon}><i className="fa fa-lightbulb"></i></div>
                    <div className={styles.statValue}>{projectCount[0].count}</div>
                    <div className={styles.statLabel}>Active Projects</div>
                </div>
                <div className={`${styles.statCard} ${styles.cardAnimate3}`}>
                    <div className={styles.statIcon}><i className="fa fa-calendar-check"></i></div>
                    <div className={styles.statValue}>{bookingCount[0].count}</div>
                    <div className={styles.statLabel}>Total Bookings</div>
                </div>
                <div className={`${styles.statCard} ${styles.cardAnimate4}`}>
                    <div className={styles.statIcon}><i className="fa fa-calendar-days"></i></div>
                    <div className={styles.statValue}>{eventCount[0].count}</div>
                    <div className={styles.statLabel}>Events</div>
                </div>
            </div>

            <div className={styles.controlGrid}>
                {controlItems.map(item => (
                    <Link key={item.href} href={item.href} className={styles.controlCard}>
                        {item.badge > 0 && (
                            <span className={styles.controlBadge}>{item.badge}</span>
                        )}
                        <div className={styles.controlIcon}><i className={`fa ${item.icon}`}></i></div>
                        <h3 className={styles.controlTitle}>{item.title}</h3>
                        <p className={styles.controlDesc}>{item.desc}</p>
                        <span className={styles.controlArrow}>Open <i className="fa fa-arrow-right"></i></span>
                    </Link>
                ))}
            </div>
        </main>
    )
}
