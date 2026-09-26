import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from './student.module.css'
import { RowDataPacket } from '@/lib/types'


export const dynamic = 'force-dynamic'

interface UserData extends RowDataPacket {
    id: string
    name: string
    militaryId: string
    email: string
    rank: string
    unit: string
}

interface ProjectData extends RowDataPacket {
    id: string
    title: string
    status: string
    createdAt: Date
}

interface BookingData extends RowDataPacket {
    id: string
    labName: string
    bookingDate: Date
    timeSlot: string
    status: string
}

interface EventData extends RowDataPacket {
    id: string
    title: string
    eventDate: Date
    location: string
}

export default async function StudentProfile() {
    const session = await getSession()

    if (!session.isLoggedIn || !session.userId) {
        redirect('/login')
    }

    // Fetch User Details - Join with profile to get name
    const users = await query<UserData[]>(
        `SELECT u.*, sp.fullName as name, sp.yearLevel as rank 
         FROM users u 
         LEFT JOIN student_profiles sp ON u.id = sp.userId 
         WHERE u.id = ?`,
        [session.userId]
    )
    const user = users[0]

    if (!user) {
        redirect('/login')
    }

    // Fetch Projects (Created by or Member of)
    // Assuming a simple relationship for now, or just created_by
    const projects = await query<ProjectData[]>(
        `SELECT p.* FROM projects p 
     LEFT JOIN project_members pm ON p.id = pm.projectId 
     WHERE p.createdById = ? OR pm.userId = ? 
     GROUP BY p.id
     ORDER BY p.createdAt DESC`,
        [user.id, user.id]
    )

    // Fetch Lab Bookings
    const bookings = await query<BookingData[]>(
        `SELECT b.id, l.name as labName, b.bookingDate, b.timeSlot, b.status 
     FROM lab_bookings b 
     JOIN labs l ON b.labId = l.id 
     WHERE b.userId = ? 
     ORDER BY b.bookingDate DESC`,
        [user.id]
    )

    // Fetch Event Registrations
    const events = await query<EventData[]>(
        `SELECT e.id, e.title, e.startDate as eventDate, e.location 
     FROM event_registrations er 
     JOIN events e ON er.eventId = e.id 
     WHERE er.userId = ? 
     ORDER BY e.startDate DESC`,
        [user.id]
    )



    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <div className={styles.profileInfo}>
                    <div className={styles.avatarPlaceholder}>
                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1>{user.name || user.email}</h1>
                        <p className={styles.militaryId}>Military ID: {user.militaryId}</p>
                        <div className={styles.badges}>
                            <span className={styles.badge}>{user.rank || 'Student'}</span>
                            <span className={styles.badge}>{user.unit || 'General'}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.actions}>
                    <Link href="/projects/create" className={styles.actionBtn}>New Project</Link>
                    <Link href="/lab-booking" className={styles.actionBtn}>Book Lab</Link>
                </div>
            </header>

            {/* Quick Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><i className="fa fa-lightbulb"></i></div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{projects.length}</div>
                        <div className={styles.statLabel}>My Projects</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><i className="fa fa-flask"></i></div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{bookings.filter(b => b.status === 'PENDING' || b.status === 'APPROVED').length}</div>
                        <div className={styles.statLabel}>Active Bookings</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><i className="fa fa-calendar"></i></div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{events.length}</div>
                        <div className={styles.statLabel}>Registered Events</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><i className="fa fa-check-circle"></i></div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{projects.filter(p => p.status === 'COMPLETED').length}</div>
                        <div className={styles.statLabel}>Completed</div>
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.column} style={{ width: '100%' }}>
                    <section className={`${styles.section} animate-slide-up delay-1`}>
                        <h2><i className="fa-solid fa-lightbulb" style={{ color: 'var(--gold)' }}></i> My Projects</h2>
                        <div className={styles.list}>
                            {projects.length === 0 ? (
                                <p className={styles.empty}>No active projects.</p>
                            ) : (
                                projects.map(p => (
                                    <div key={p.id} className={styles.card}>
                                        <div>
                                            <h3>{p.title}</h3>
                                            <span className={`${styles.status} ${styles[p.status.toLowerCase()]}`}>
                                                {p.status}
                                            </span>
                                        </div>
                                        <Link href={`/projects/${p.id}`} className={styles.link}>View Details</Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section className={`${styles.section} animate-slide-up delay-2`}>
                        <h2><i className="fa-solid fa-flask" style={{ color: 'var(--gold)' }}></i> Lab Bookings</h2>
                        <div className={styles.list}>
                            {bookings.length === 0 ? (
                                <p className={styles.empty}>No upcoming bookings.</p>
                            ) : (
                                bookings.map(b => (
                                    <div key={b.id} className={styles.card}>
                                        <div>
                                            <h3>{b.labName}</h3>
                                            <p>{new Date(b.bookingDate).toLocaleDateString()} - {b.timeSlot}</p>
                                            <span className={`${styles.status} ${styles[b.status.toLowerCase()]}`}>
                                                {b.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section className={`${styles.section} animate-slide-up delay-3`}>
                        <h2><i className="fa-solid fa-calendar-check" style={{ color: 'var(--gold)' }}></i> Registered Events</h2>
                        <div className={styles.list}>
                            {events.length === 0 ? (
                                <p className={styles.empty}>No registered events.</p>
                            ) : (
                                events.map(e => (
                                    <div key={e.id} className={styles.card}>
                                        <div>
                                            <h3>{e.title}</h3>
                                            <p>{new Date(e.eventDate).toLocaleDateString()} @ {e.location}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    )
}
