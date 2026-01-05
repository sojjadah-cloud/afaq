import { query } from '@/lib/db'
import styles from './admin.module.css'
import { RowDataPacket } from 'mysql2'
import Link from 'next/link'
import AdminNav from '@/components/AdminNav'

interface CountResult extends RowDataPacket {
    count: number
}

interface RecentBooking extends RowDataPacket {
    id: string
    labName: string
    militaryId: string
    bookingDate: Date
    timeSlot: string
    status: string
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

    // Recent bookings
    const recentBookings = await query<RecentBooking[]>(`
        SELECT 
            b.id, l.name as labName, u.militaryId, 
            b.bookingDate, b.timeSlot, b.status 
        FROM lab_bookings b
        JOIN labs l ON b.labId = l.id
        JOIN users u ON b.userId = u.id
        ORDER BY b.createdAt DESC
        LIMIT 5
    `)

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>Admin Control Panel</h2>
                <p>System Overview & Management</p>
            </div>

            <AdminNav />

            {/* Quick Action Alerts */}
            {(pendingRegistrations > 0 || newMessages > 0 || pendingBookings > 0 || pendingProjects > 0) && (
                <div className={styles.alertsBar}>
                    {pendingProjects > 0 && (
                        <Link href="/admin/projects" className={styles.alertItem} style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                            <i className="fa fa-lightbulb"></i>
                            <span>{pendingProjects} pending project{pendingProjects > 1 ? 's' : ''}</span>
                        </Link>
                    )}
                    {newMessages > 0 && (
                        <Link href="/admin/requests" className={styles.alertItem} style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                            <i className="fa fa-envelope"></i>
                            <span>{newMessages} new message{newMessages > 1 ? 's' : ''}</span>
                        </Link>
                    )}
                    {pendingBookings > 0 && (
                        <Link href="/admin/bookings" className={styles.alertItem} style={{ background: '#dcfce7', color: '#16a34a' }}>
                            <i className="fa fa-calendar-check"></i>
                            <span>{pendingBookings} pending booking{pendingBookings > 1 ? 's' : ''}</span>
                        </Link>
                    )}
                </div>
            )}

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

            <div className={styles.section}>
                <h3>Recent Lab Bookings</h3>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Lab</th>
                                <th>User (Mil ID)</th>
                                <th>Date</th>
                                <th>Slot</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '1rem' }}>No recent bookings found.</td>
                                </tr>
                            ) : (
                                recentBookings.map(booking => (
                                    <tr key={booking.id}>
                                        <td>{booking.labName}</td>
                                        <td>{booking.militaryId}</td>
                                        <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                        <td>{booking.timeSlot}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[booking.status.toLowerCase()]}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Link href="/admin/bookings" className={styles.actionBtn}>View</Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    )
}
