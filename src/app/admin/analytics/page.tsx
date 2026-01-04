import { query } from '@/lib/db'
import { RowDataPacket } from 'mysql2'
import styles from '../admin.module.css'
import Link from 'next/link'

interface Stats extends RowDataPacket {
    count: number
}

interface MonthlyData extends RowDataPacket {
    month: string
    count: number
}

export default async function AnalyticsPage() {
    // Get various statistics
    const [userStats] = await query<Stats[]>('SELECT COUNT(*) as count FROM users')
    const [projectStats] = await query<Stats[]>('SELECT COUNT(*) as count FROM projects')
    const [bookingStats] = await query<Stats[]>('SELECT COUNT(*) as count FROM lab_bookings')
    const [eventStats] = await query<Stats[]>('SELECT COUNT(*) as count FROM events')
    const [researchStats] = await query<Stats[]>('SELECT COUNT(*) as count FROM research')

    // Get project status distribution
    const projectsByStatus = await query<RowDataPacket[]>(`
        SELECT status, COUNT(*) as count 
        FROM projects 
        GROUP BY status
    `)

    // Get user role distribution
    const usersByRole = await query<RowDataPacket[]>(`
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role
    `)

    // Get booking status distribution
    const bookingsByStatus = await query<RowDataPacket[]>(`
        SELECT status, COUNT(*) as count 
        FROM lab_bookings 
        GROUP BY status
    `)

    // Get recent activity (last 7 days)
    const recentProjects = await query<Stats[]>(`
        SELECT COUNT(*) as count FROM projects 
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `)
    const recentBookings = await query<Stats[]>(`
        SELECT COUNT(*) as count FROM lab_bookings 
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `)
    const recentEvents = await query<Stats[]>(`
        SELECT COUNT(*) as count FROM events 
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `)

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            START: '#f59e0b',
            DEVELOPMENT: '#3b82f6',
            COMPLETED: '#10b981',
            PENDING: '#f59e0b',
            APPROVED: '#10b981',
            REJECTED: '#ef4444',
            CANCELLED: '#6b7280',
            STUDENT: '#3b82f6',
            STAFF: '#8b5cf6',
            ADMIN: '#ef4444'
        }
        return colors[status] || '#6b7280'
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>Analytics Dashboard</h2>
                <p>Platform Statistics & Insights</p>
            </div>

            <div className={styles.adminNav}>
                <Link href="/admin" className={styles.navLink}>
                    <i className="fa fa-chart-simple"></i> Overview
                </Link>
                <Link href="/admin/bookings" className={styles.navLink}>
                    <i className="fa fa-calendar-check"></i> Bookings
                </Link>
                <Link href="/admin/analytics" className={`${styles.navLink} ${styles.active}`}>
                    <i className="fa fa-chart-pie"></i> Analytics
                </Link>
                <Link href="/admin/audit" className={styles.navLink}>
                    <i className="fa fa-clipboard-list"></i> Audit Log
                </Link>
            </div>

            {/* Key Metrics */}
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.cardAnimate1}`}>
                    <div className={styles.statIcon}><i className="fa fa-users"></i></div>
                    <div className={styles.statValue}>{userStats?.count || 0}</div>
                    <div className={styles.statLabel}>Total Users</div>
                </div>
                <div className={`${styles.statCard} ${styles.cardAnimate2}`}>
                    <div className={styles.statIcon}><i className="fa fa-lightbulb"></i></div>
                    <div className={styles.statValue}>{projectStats?.count || 0}</div>
                    <div className={styles.statLabel}>Projects</div>
                </div>
                <div className={`${styles.statCard} ${styles.cardAnimate3}`}>
                    <div className={styles.statIcon}><i className="fa fa-scroll"></i></div>
                    <div className={styles.statValue}>{researchStats?.count || 0}</div>
                    <div className={styles.statLabel}>Research</div>
                </div>
                <div className={`${styles.statCard} ${styles.cardAnimate4}`}>
                    <div className={styles.statIcon}><i className="fa fa-calendar"></i></div>
                    <div className={styles.statValue}>{eventStats?.count || 0}</div>
                    <div className={styles.statLabel}>Events</div>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* Project Status */}
                <div className={styles.section}>
                    <h3>Projects by Status</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {projectsByStatus.map((item) => (
                            <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '100px', fontWeight: 600, color: '#4a5568' }}>{item.status}</div>
                                <div style={{ flex: 1, height: '24px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${(item.count / (projectStats?.count || 1)) * 100}%`,
                                        height: '100%',
                                        background: getStatusColor(item.status),
                                        borderRadius: '4px',
                                        transition: 'width 0.5s ease'
                                    }}></div>
                                </div>
                                <div style={{ width: '40px', fontWeight: 700, color: '#1e293b' }}>{item.count}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Roles */}
                <div className={styles.section}>
                    <h3>Users by Role</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {usersByRole.map((item) => (
                            <div key={item.role} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '100px', fontWeight: 600, color: '#4a5568' }}>{item.role}</div>
                                <div style={{ flex: 1, height: '24px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${(item.count / (userStats?.count || 1)) * 100}%`,
                                        height: '100%',
                                        background: getStatusColor(item.role),
                                        borderRadius: '4px'
                                    }}></div>
                                </div>
                                <div style={{ width: '40px', fontWeight: 700, color: '#1e293b' }}>{item.count}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Booking Status */}
                <div className={styles.section}>
                    <h3>Bookings by Status</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {bookingsByStatus.map((item) => (
                            <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '100px', fontWeight: 600, color: '#4a5568' }}>{item.status}</div>
                                <div style={{ flex: 1, height: '24px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${(item.count / (bookingStats?.count || 1)) * 100}%`,
                                        height: '100%',
                                        background: getStatusColor(item.status),
                                        borderRadius: '4px'
                                    }}></div>
                                </div>
                                <div style={{ width: '40px', fontWeight: 700, color: '#1e293b' }}>{item.count}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className={styles.section}>
                    <h3>Last 7 Days Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '10px' }}>
                            <span style={{ color: '#64748b' }}>New Projects</span>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{recentProjects[0]?.count || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '10px' }}>
                            <span style={{ color: '#64748b' }}>New Bookings</span>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{recentBookings[0]?.count || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '10px' }}>
                            <span style={{ color: '#64748b' }}>New Events</span>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{recentEvents[0]?.count || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
