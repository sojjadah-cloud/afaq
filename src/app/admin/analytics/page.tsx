import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import styles from '../admin.module.css'
import Link from 'next/link'
import AdminNav from '@/components/AdminNav'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { pageTitle } from '@/lib/metadata'
import { getT } from '@/i18n/server'

const LABELS: Record<string, string> = {
    START: 'Start', DEVELOPMENT: 'In Development', COMPLETED: 'Completed',
    PENDING_APPROVAL: 'Awaiting Approval', PENDING_COMPLETION: 'Awaiting Completion', REJECTED: 'Rejected',
    PENDING: 'Pending', APPROVED: 'Approved', CANCELLED: 'Cancelled',
    STUDENT: 'Student', STAFF: 'Staff', ADMIN: 'Administrator',
}

// Seven days ago in Oman time, matching how dates are stored.
const WEEK_AGO = "strftime('%Y-%m-%d %H:%M:%f', 'now', '+4 hours', '-7 days')"

export const generateMetadata = () => pageTitle('Analytics')

export const dynamic = 'force-dynamic'

interface Stats extends RowDataPacket {
    count: number
}

interface MonthlyData extends RowDataPacket {
    month: string
    count: number
}

export default async function AnalyticsPage() {
    const session = await getSession()
    if (session.role !== 'ADMIN') redirect('/staff')
    const { t } = await getT()

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
        WHERE createdAt >= ${WEEK_AGO}
    `)
    const recentBookings = await query<Stats[]>(`
        SELECT COUNT(*) as count FROM lab_bookings
        WHERE createdAt >= ${WEEK_AGO}
    `)
    const recentEvents = await query<Stats[]>(`
        SELECT COUNT(*) as count FROM events
        WHERE createdAt >= ${WEEK_AGO}
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
                <h2>{t('Analytics')}</h2>
                <p>{t('Platform statistics and insights')}</p>
            </div>

            <AdminNav />

            {/* Key Metrics */}
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.cardAnimate1}`}>
                    <div className={styles.statIcon}><i className="fa fa-users"></i></div>
                    <div className={styles.statValue}>{userStats?.count || 0}</div>
                    <div className={styles.statLabel}>{t('Total Users')}</div>
                </div>
                <div className={`${styles.statCard} ${styles.cardAnimate2}`}>
                    <div className={styles.statIcon}><i className="fa fa-lightbulb"></i></div>
                    <div className={styles.statValue}>{projectStats?.count || 0}</div>
                    <div className={styles.statLabel}>{t('Projects')}</div>
                </div>
                <div className={`${styles.statCard} ${styles.cardAnimate3}`}>
                    <div className={styles.statIcon}><i className="fa fa-scroll"></i></div>
                    <div className={styles.statValue}>{researchStats?.count || 0}</div>
                    <div className={styles.statLabel}>{t('Research')}</div>
                </div>
                <div className={`${styles.statCard} ${styles.cardAnimate4}`}>
                    <div className={styles.statIcon}><i className="fa fa-calendar"></i></div>
                    <div className={styles.statValue}>{eventStats?.count || 0}</div>
                    <div className={styles.statLabel}>{t('Events')}</div>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* Project Status */}
                <div className={styles.section}>
                    <h3>{t('Projects by status')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {projectsByStatus.map((item) => (
                            <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '120px', fontWeight: 600, color: '#4a5568' }}>{t(LABELS[item.status] || item.status)}</div>
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
                    <h3>{t('Users by role')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {usersByRole.map((item) => (
                            <div key={item.role} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '120px', fontWeight: 600, color: '#4a5568' }}>{t(LABELS[item.role] || item.role)}</div>
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
                    <h3>{t('Bookings by status')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {bookingsByStatus.map((item) => (
                            <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '120px', fontWeight: 600, color: '#4a5568' }}>{t(LABELS[item.status] || item.status)}</div>
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
                    <h3>{t('Activity in the last 7 days')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '10px' }}>
                            <span style={{ color: '#64748b' }}>{t('New projects')}</span>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{recentProjects[0]?.count || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '10px' }}>
                            <span style={{ color: '#64748b' }}>{t('New bookings')}</span>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{recentBookings[0]?.count || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '10px' }}>
                            <span style={{ color: '#64748b' }}>{t('New events')}</span>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{recentEvents[0]?.count || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
