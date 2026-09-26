import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { RowDataPacket } from 'mysql2'
import styles from '../admin/admin.module.css'

export const dynamic = 'force-dynamic'

interface PendingItem extends RowDataPacket {
    id: string
    type: string
    title: string
    userName: string
    createdAt: Date
}

export default async function StaffDashboard() {
    const session = await getSession()

    if (!session.isLoggedIn || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
        redirect('/login')
    }

    // Get pending bookings
    const pendingBookings = await query<RowDataPacket[]>(`
        SELECT 
            b.id, 
            'booking' as type,
            l.name as title,
            COALESCE(sp.fullName, u.email) as userName,
            b.createdAt
        FROM lab_bookings b
        JOIN labs l ON b.labId = l.id
        JOIN users u ON b.userId = u.id
        LEFT JOIN student_profiles sp ON u.id = sp.userId
        WHERE b.status = 'PENDING'
        ORDER BY b.createdAt ASC
    `)

    // Get pending project join requests
    const pendingJoinRequests = await query<RowDataPacket[]>(`
        SELECT 
            pm.id,
            'join_request' as type,
            p.title,
            COALESCE(sp.fullName, u.email) as userName,
            pm.joinedAt as createdAt
        FROM project_members pm
        JOIN projects p ON pm.projectId = p.id
        JOIN users u ON pm.userId = u.id
        LEFT JOIN student_profiles sp ON u.id = sp.userId
        WHERE pm.status = 'PENDING'
        ORDER BY pm.joinedAt ASC
    `)

    // Get user stats
    const [userCount] = await query<RowDataPacket[]>('SELECT COUNT(*) as count FROM users')
    const [projectCount] = await query<RowDataPacket[]>('SELECT COUNT(*) as count FROM projects')
    const [bookingCount] = await query<RowDataPacket[]>('SELECT COUNT(*) as count FROM lab_bookings WHERE status = \'PENDING\'')

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>Staff Dashboard</h2>
                <p>Pending Approvals & Management</p>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.cardAnimate1}`}>
                    <div className={styles.statIcon}><i className="fa fa-users"></i></div>
                    <div className={styles.statValue}>{userCount?.count || 0}</div>
                    <div className={styles.statLabel}>Total Users</div>
                </div>
                <div className={`${styles.statCard} ${styles.cardAnimate2}`}>
                    <div className={styles.statIcon}><i className="fa fa-lightbulb"></i></div>
                    <div className={styles.statValue}>{projectCount?.count || 0}</div>
                    <div className={styles.statLabel}>Projects</div>
                </div>
                <div className={`${styles.statCard} ${styles.cardAnimate3}`}>
                    <div className={styles.statIcon}><i className="fa fa-clock"></i></div>
                    <div className={styles.statValue}>{bookingCount?.count || 0}</div>
                    <div className={styles.statLabel}>Pending Bookings</div>
                </div>
                <div className={`${styles.statCard} ${styles.cardAnimate4}`}>
                    <div className={styles.statIcon}><i className="fa fa-user-plus"></i></div>
                    <div className={styles.statValue}>{pendingJoinRequests.length}</div>
                    <div className={styles.statLabel}>Join Requests</div>
                </div>
            </div>

            {/* Pending Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Pending Bookings */}
                <div className={styles.section}>
                    <h3><i className="fa fa-calendar-check" style={{ color: 'var(--gold)' }}></i> Pending Lab Bookings</h3>
                    {pendingBookings.length === 0 ? (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                            No pending bookings
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {pendingBookings.slice(0, 5).map((item: any) => (
                                <div key={item.id} style={{
                                    padding: '1rem',
                                    background: '#fffbef',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <strong style={{ color: '#1e293b' }}>{item.title}</strong>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                            by {item.userName}
                                        </div>
                                    </div>
                                    <Link href="/admin/bookings" style={{ color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'none' }}>
                                        Review →
                                    </Link>
                                </div>
                            ))}
                            {pendingBookings.length > 5 && (
                                <Link href="/admin/bookings" style={{ color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                                    View all {pendingBookings.length} pending bookings →
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Pending Join Requests */}
                <div className={styles.section}>
                    <h3><i className="fa fa-user-plus" style={{ color: 'var(--gold)' }}></i> Project Join Requests</h3>
                    {pendingJoinRequests.length === 0 ? (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                            No pending requests
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {pendingJoinRequests.slice(0, 5).map((item: any) => (
                                <div key={item.id} style={{
                                    padding: '1rem',
                                    background: '#f0f9ff',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <strong style={{ color: '#1e293b' }}>{item.userName}</strong>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                            wants to join {item.title}
                                        </div>
                                    </div>
                                    <Link href={`/projects`} style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
                                        Review →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Links */}
            <div className={styles.section} style={{ marginTop: '2rem' }}>
                <h3>Quick Actions</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link href="/admin/bookings" className={styles.navLink}>
                        <i className="fa fa-calendar-check"></i> Manage Bookings
                    </Link>
                    <Link href="/research" className={styles.navLink}>
                        <i className="fa fa-scroll"></i> Add Research
                    </Link>
                    <Link href="/events" className={styles.navLink}>
                        <i className="fa fa-calendar"></i> Manage Events
                    </Link>
                    <Link href="/forums" className={styles.navLink}>
                        <i className="fa fa-comments"></i> View Forums
                    </Link>
                </div>
            </div>
        </main>
    )
}
