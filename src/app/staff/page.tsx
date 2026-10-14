import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { RowDataPacket } from '@/lib/types'
import styles from '../admin/admin.module.css'
import { getT } from '@/i18n/server'
import { formatDay } from '@/i18n/core'
import { pageTitle } from '@/lib/metadata'

export const generateMetadata = () => pageTitle('Staff Dashboard')

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

    if (!session.isLoggedIn) {
        redirect('/login')
    }
    if (session.role !== 'STAFF' && session.role !== 'ADMIN') {
        redirect('/')
    }
    const { t, lang } = await getT()

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
            p.id as projectId,
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
    const supervised = await query<RowDataPacket[]>(
        `SELECT p.id, p.title, p.status, p.progress, p.updatedAt,
                (SELECT MAX(createdAt) FROM project_updates pu WHERE pu.projectId = p.id AND pu.type = 'UPDATE') as lastUpdate
         FROM projects p WHERE p.supervisorId = ? ORDER BY p.updatedAt DESC`,
        [session.userId]
    )

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>{t('Staff Dashboard')}</h2>
                <p>{t('Pending approvals and management')}</p>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.cardAnimate1}`}>
                    <div className={styles.statIcon} aria-hidden="true"><i className="fa fa-users"></i></div>
                    <div className={styles.statValue}>{userCount?.count || 0}</div>
                    <div className={styles.statLabel}>{t('Total Users')}</div>
                </div>
                <div className={`${styles.statCard} ${styles.cardAnimate2}`}>
                    <div className={styles.statIcon} aria-hidden="true"><i className="fa fa-lightbulb"></i></div>
                    <div className={styles.statValue}>{projectCount?.count || 0}</div>
                    <div className={styles.statLabel}>{t('Projects')}</div>
                </div>
                <div className={`${styles.statCard} ${styles.cardAnimate3}`}>
                    <div className={styles.statIcon} aria-hidden="true"><i className="fa fa-clock"></i></div>
                    <div className={styles.statValue}>{bookingCount?.count || 0}</div>
                    <div className={styles.statLabel}>{t('Pending Bookings')}</div>
                </div>
                <div className={`${styles.statCard} ${styles.cardAnimate4}`}>
                    <div className={styles.statIcon} aria-hidden="true"><i className="fa fa-user-plus"></i></div>
                    <div className={styles.statValue}>{pendingJoinRequests.length}</div>
                    <div className={styles.statLabel}>{t('Join Requests')}</div>
                </div>
            </div>

            {/* Pending Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))', gap: '2rem' }}>
                {/* Pending Bookings */}
                <div className={styles.section}>
                    <h3><i className="fa fa-calendar-check" style={{ color: 'var(--gold)' }} aria-hidden="true"></i> {t('Pending Bookings')}</h3>
                    {pendingBookings.length === 0 ? (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                            {t('No pending bookings')}
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
                                            {t('by {name}', { name: item.userName })}
                                        </div>
                                    </div>
                                    <Link href="/admin/bookings" style={{ color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'none' }}>
                                        {t('Review')} <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                                    </Link>
                                </div>
                            ))}
                            {pendingBookings.length > 5 && (
                                <Link href="/admin/bookings" style={{ color: 'var(--gold-dark)', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                                    {t('View all {n} pending bookings', { n: pendingBookings.length })} <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Pending Join Requests */}
                <div className={styles.section}>
                    <h3><i className="fa fa-user-plus" style={{ color: 'var(--gold)' }} aria-hidden="true"></i> {t('Project Join Requests')}</h3>
                    {pendingJoinRequests.length === 0 ? (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                            {t('No pending requests')}
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
                                            {t('wants to join {project}', { project: item.title })}
                                        </div>
                                    </div>
                                    <Link href={`/projects/${item.projectId}`} style={{ color: '#1d4ed8', fontWeight: 600, textDecoration: 'none' }}>
                                        {t('Review')} <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.section} style={{ marginTop: '2rem' }}>
                <h3><i className="fa fa-user-tie" style={{ color: 'var(--gold)' }} aria-hidden="true"></i> {t('Projects I Supervise')}</h3>
                {supervised.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '1.5rem' }}>
                        {t('You are not supervising any project yet. Assign yourself from a project page.')}
                    </p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '0.75rem' }}>
                        {supervised.map((p: any) => (
                            <Link key={p.id} href={`/projects/${p.id}`} style={{ display: 'block', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', textDecoration: 'none', color: 'inherit' }}>
                                <strong style={{ color: '#1e293b' }}>{p.title}</strong>
                                <div style={{ height: '6px', borderRadius: '3px', background: '#efece0', margin: '0.6rem 0 0.4rem', overflow: 'hidden' }}>
                                    <div style={{ width: `${Number(p.progress) || 0}%`, height: '100%', background: 'var(--gold)' }}></div>
                                </div>
                                <small style={{ color: '#64748b' }}>
                                    {Number(p.progress) || 0}% · {p.lastUpdate ? t('last update {date}', { date: formatDay(lang, p.lastUpdate) }) : t('no progress updates yet')}
                                </small>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Links */}
            <div className={styles.section} style={{ marginTop: '2rem' }}>
                <h3>{t('Quick Actions')}</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link href="/admin/bookings" className={styles.navLink}>
                        <i className="fa fa-calendar-check" aria-hidden="true"></i> {t('Manage Bookings')}
                    </Link>
                    <Link href="/admin/projects" className={styles.navLink}>
                        <i className="fa fa-lightbulb" aria-hidden="true"></i> {t('Project Approvals')}
                    </Link>
                    <Link href="/admin/requests" className={styles.navLink}>
                        <i className="fa fa-inbox" aria-hidden="true"></i> {t('Requests & Messages')}
                    </Link>
                    <Link href="/admin/events" className={styles.navLink}>
                        <i className="fa fa-calendar" aria-hidden="true"></i> {t('Manage Events')}
                    </Link>
                    <Link href="/admin/equipment" className={styles.navLink}>
                        <i className="fa fa-screwdriver-wrench" aria-hidden="true"></i> {t('Manage Equipment')}
                    </Link>
                    <Link href="/research" className={styles.navLink}>
                        <i className="fa fa-scroll" aria-hidden="true"></i> {t('Add Research')}
                    </Link>
                    <Link href="/forums" className={styles.navLink}>
                        <i className="fa fa-comments" aria-hidden="true"></i> {t('View Forums')}
                    </Link>
                </div>
            </div>
        </main>
    )
}
