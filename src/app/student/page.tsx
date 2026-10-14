import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import { initials, todayInOman } from '@/lib/utils'
import CancelBookingButton from '@/components/CancelBookingButton'
import styles from './student.module.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'My Dashboard' }

const ROLE_LABELS: Record<string, string> = { ADMIN: 'Administrator', STAFF: 'Staff', STUDENT: 'Student' }
const PROJECT_STATUS: Record<string, string> = {
    START: 'Start',
    DEVELOPMENT: 'In Development',
    COMPLETED: 'Completed',
    PENDING_APPROVAL: 'Awaiting Approval',
    PENDING_COMPLETION: 'Awaiting Completion',
}
const BOOKING_STATUS: Record<string, string> = {
    PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected', CANCELLED: 'Cancelled', COMPLETED: 'Completed',
}
const MEMBERSHIP: Record<string, { label: string; text: string }> = {
    PENDING: { label: 'Under review', text: 'Your membership application is being reviewed by the club.' },
    APPROVED: { label: 'Member', text: 'You are a member of the AFAQ Scientific Club.' },
    REJECTED: { label: 'Not approved', text: 'Your application was not approved. Contact the club for details.' },
}

function formatDay(value: string | null) {
    if (!value) return ''
    const [y, m, d] = String(value).slice(0, 10).split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function StudentProfile() {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) redirect('/login')
    const today = todayInOman()
    const weekAhead = new Date(Date.parse(today) + 7 * 864e5).toISOString().slice(0, 10)

    const users = await query<RowDataPacket[]>(
        `SELECT u.id, u.militaryId, u.email, u.role, sp.fullName as name, sp.yearLevel, sp.bio,
                d.name as department, pr.name as programme
         FROM users u
         LEFT JOIN student_profiles sp ON u.id = sp.userId
         LEFT JOIN departments d ON sp.departmentId = d.id
         LEFT JOIN programmes pr ON sp.programmeId = pr.id
         WHERE u.id = ?`,
        [session.userId]
    )
    const user = users[0]
    if (!user) redirect('/login')

    const projects = await query<RowDataPacket[]>(
        `SELECT p.id, p.title, p.status, p.progress, p.createdById FROM projects p
         LEFT JOIN project_members pm ON p.id = pm.projectId AND pm.status = 'APPROVED'
         WHERE p.createdById = ? OR pm.userId = ?
         GROUP BY p.id
         ORDER BY p.updatedAt DESC`,
        [user.id, user.id]
    )
    const joinRequests = await query<RowDataPacket[]>(
        `SELECT p.id as projectId, p.title, COALESCE(sp.fullName, u.militaryId) as name
         FROM project_members pm
         JOIN projects p ON p.id = pm.projectId
         JOIN users u ON u.id = pm.userId
         LEFT JOIN student_profiles sp ON sp.userId = pm.userId
         WHERE pm.status = 'PENDING' AND p.createdById = ?`,
        [user.id]
    )
    const bookings = await query<RowDataPacket[]>(
        `SELECT b.id, l.name as labName, c.key as categoryKey, b.bookingDate, b.timeSlot, b.status, b.returnDate
         FROM lab_bookings b
         JOIN labs l ON b.labId = l.id
         JOIN lab_categories c ON c.id = l.categoryId
         WHERE b.userId = ?
         ORDER BY b.bookingDate DESC`,
        [user.id]
    )
    const events = await query<RowDataPacket[]>(
        `SELECT e.id, e.title, e.startDate, e.endDate, e.location, er.attended
         FROM event_registrations er
         JOIN events e ON er.eventId = e.id
         WHERE er.userId = ? AND er.status = 'REGISTERED'
         ORDER BY e.startDate DESC`,
        [user.id]
    )
    const membership = await query<RowDataPacket[]>(
        'SELECT status, createdAt FROM club_registrations WHERE userId = ? ORDER BY createdAt DESC LIMIT 1',
        [user.id]
    )

    const day = (v: unknown) => String(v || '').slice(0, 10)
    // A borrowed item stays current until staff record its return.
    const isOut = (b: RowDataPacket) => b.status === 'APPROVED' && !!b.returnDate && day(b.bookingDate) < today
    const isOverdue = (b: RowDataPacket) => isOut(b) && day(b.returnDate) < today
    const upcomingBookings = bookings.filter(b => isOut(b) || (['PENDING', 'APPROVED'].includes(b.status) && day(b.bookingDate) >= today))
    const pastBookings = bookings.filter(b => !upcomingBookings.includes(b))
    const upcomingEvents = events.filter(e => day(e.endDate || e.startDate) >= today).reverse()
    const pastEvents = events.filter(e => day(e.endDate || e.startDate) < today)
    const soonBookings = upcomingBookings.filter(b => day(b.bookingDate) <= weekAhead)
    const memberStatus = membership[0] ? MEMBERSHIP[membership[0].status] : null

    const attention = [
        ...joinRequests.map(r => ({ icon: 'fa-user-plus', text: `${r.name} wants to join ${r.title}`, href: `/projects/${r.projectId}`, action: 'Review' })),
        ...upcomingBookings.filter(isOverdue).map(b => ({ icon: 'fa-triangle-exclamation', text: `${b.labName} was due back on ${formatDay(b.returnDate)}. Please return it to the tool store.`, href: '#bookings', action: 'View' })),
        ...soonBookings.filter(b => !isOut(b)).map(b => ({ icon: 'fa-calendar-check', text: `${b.labName} on ${formatDay(b.bookingDate)}, ${b.timeSlot} (${BOOKING_STATUS[b.status]})`, href: '#bookings', action: 'View' })),
        ...upcomingEvents.slice(0, 3).map(e => ({ icon: 'fa-calendar-days', text: `${e.title} on ${formatDay(e.startDate)}`, href: `/events/${e.id}`, action: 'Open' })),
    ]

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <div className={styles.profileInfo}>
                    <div className={styles.avatarPlaceholder}>{initials(user.name || user.email, 'U')}</div>
                    <div>
                        <h1>{user.name || user.email}</h1>
                        <p className={styles.militaryId}>Military ID: {user.militaryId}</p>
                        <div className={styles.badges}>
                            <span className={styles.badge}>{user.yearLevel || ROLE_LABELS[user.role] || 'Member'}</span>
                            {user.department && <span className={styles.badge}>{user.department}</span>}
                            {user.programme && <span className={styles.badge}>{user.programme}</span>}
                        </div>
                    </div>
                </div>
                <div className={styles.actions}>
                    <Link href="/projects?new=1" className={styles.actionBtn}><i className="fa-solid fa-plus"></i> New Project</Link>
                    <Link href="/equipment" className={styles.actionBtn}><i className="fa-solid fa-screwdriver-wrench"></i> Book or Borrow</Link>
                    <Link href="/student/settings" className={styles.actionBtnSecondary}><i className="fa-solid fa-gear"></i> Settings</Link>
                </div>
            </header>

            <div className={styles.topGrid}>
                <section className={styles.section} aria-labelledby="attention-title">
                    <h2 id="attention-title"><i className="fa-solid fa-bell"></i> Needs your attention</h2>
                    {attention.length === 0 ? (
                        <p className={styles.empty}>Nothing pending right now.</p>
                    ) : (
                        <ul className={styles.attentionList}>
                            {attention.map((a, i) => (
                                <li key={i}>
                                    <i className={`fa-solid ${a.icon}`}></i>
                                    <span>{a.text}</span>
                                    <Link href={a.href} className={styles.link}>{a.action}</Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className={styles.section} aria-labelledby="membership-title">
                    <h2 id="membership-title"><i className="fa-solid fa-id-badge"></i> Club membership</h2>
                    {memberStatus ? (
                        <div className={styles.membership}>
                            <span className={`${styles.status} ${styles[`member${membership[0].status}`] || ''}`}>{memberStatus.label}</span>
                            <p>{memberStatus.text}</p>
                            <small>Applied {formatDay(membership[0].createdAt)}</small>
                        </div>
                    ) : (
                        <div className={styles.membership}>
                            <p>You have not applied to join the AFAQ Scientific Club yet.</p>
                            <Link href="/#join" className={styles.link}>Apply to join</Link>
                        </div>
                    )}
                </section>
            </div>

            <section className={styles.section} aria-labelledby="projects-title">
                <h2 id="projects-title"><i className="fa-solid fa-lightbulb"></i> My Projects</h2>
                <div className={styles.list}>
                    {projects.length === 0 ? (
                        <p className={styles.empty}>You are not part of any project yet. <Link href="/projects">Browse projects</Link> or start a new one.</p>
                    ) : projects.map(p => (
                        <div key={p.id} className={styles.card}>
                            <div className={styles.cardBody}>
                                <h3>{p.title}</h3>
                                <div className={styles.cardMeta}>
                                    <span className={`${styles.status} ${styles[String(p.status).toLowerCase()] || ''}`}>{PROJECT_STATUS[p.status] || p.status}</span>
                                    <span>{p.createdById === user.id ? 'Owner' : 'Member'}</span>
                                </div>
                                <div className={styles.progress}><div style={{ width: `${Number(p.progress) || 0}%` }}></div></div>
                            </div>
                            <Link href={`/projects/${p.id}`} className={styles.link}>Open</Link>
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles.section} id="bookings" aria-labelledby="bookings-title">
                <h2 id="bookings-title"><i className="fa-solid fa-calendar-check"></i> Bookings &amp; borrowed items</h2>
                {bookings.length === 0 ? (
                    <p className={styles.empty}>No bookings yet. <Link href="/equipment">Browse workshops, labs and tools</Link>.</p>
                ) : (
                    <>
                        <h3 className={styles.subTitle}>Current &amp; upcoming</h3>
                        {upcomingBookings.length === 0 ? <p className={styles.empty}>No upcoming bookings.</p> : (
                            <div className={styles.list}>
                                {upcomingBookings.map(b => (
                                    <div key={b.id} className={styles.card}>
                                        <div className={styles.cardBody}>
                                            <h3>{b.labName}</h3>
                                            <p>{formatDay(b.bookingDate)} · {b.timeSlot}{b.returnDate ? ` · return by ${formatDay(b.returnDate)}` : ''}</p>
                                            {isOut(b) ? (
                                                <span className={`${styles.status} ${isOverdue(b) ? styles.rejected : styles.approved}`}>{isOverdue(b) ? 'Overdue' : 'Borrowed'}</span>
                                            ) : (
                                                <span className={`${styles.status} ${styles[String(b.status).toLowerCase()] || ''}`}>{BOOKING_STATUS[b.status] || b.status}</span>
                                            )}
                                        </div>
                                        {!isOut(b) && <CancelBookingButton bookingId={b.id} label={b.labName} />}
                                    </div>
                                ))}
                            </div>
                        )}
                        {pastBookings.length > 0 && (
                            <>
                                <h3 className={styles.subTitle}>History</h3>
                                <div className={styles.list}>
                                    {pastBookings.map(b => (
                                        <div key={b.id} className={`${styles.card} ${styles.cardMuted}`}>
                                            <div className={styles.cardBody}>
                                                <h3>{b.labName}</h3>
                                                <p>{formatDay(b.bookingDate)} · {b.timeSlot}{b.returnDate ? ` · return by ${formatDay(b.returnDate)}` : ''}</p>
                                                <span className={`${styles.status} ${styles[String(b.status).toLowerCase()] || ''}`}>{b.returnDate && b.status === 'COMPLETED' ? 'Returned' : BOOKING_STATUS[b.status] || b.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </section>

            <section className={styles.section} aria-labelledby="events-title">
                <h2 id="events-title"><i className="fa-solid fa-calendar-days"></i> Events</h2>
                {events.length === 0 ? (
                    <p className={styles.empty}>No registered events. <Link href="/events">See upcoming events</Link>.</p>
                ) : (
                    <div className={styles.list}>
                        {[...upcomingEvents, ...pastEvents].map(e => {
                            const past = day(e.endDate || e.startDate) < today
                            return (
                                <div key={e.id} className={`${styles.card} ${past ? styles.cardMuted : ''}`}>
                                    <div className={styles.cardBody}>
                                        <h3>{e.title}</h3>
                                        <p>{formatDay(e.startDate)}{e.location ? ` · ${e.location}` : ''}</p>
                                        <span className={`${styles.status} ${past ? (e.attended ? styles.completed : styles.cancelled) : styles.approved}`}>
                                            {past ? (e.attended ? 'Attended' : 'Registered') : 'Upcoming'}
                                        </span>
                                    </div>
                                    <Link href={`/events/${e.id}`} className={styles.link}>Open</Link>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>
        </main>
    )
}
