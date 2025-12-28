import { query } from '@/lib/db'
import styles from './page.module.css'
import { RowDataPacket } from 'mysql2'
import Link from 'next/link'

interface Event extends RowDataPacket {
    id: string
    title: string
    description: string
    category: string
    startDate: Date
    endDate: Date
    location: string
    registrationCount: number
}

export default async function EventsPage() {
    const events = await query<Event[]>(`
SELECT
e.*,
    (SELECT COUNT(*) FROM event_registrations er WHERE er.eventId = e.id) as registrationCount
    FROM events e
    ORDER BY e.startDate ASC
  `)

    const upcomingEvents = events.filter(e => new Date(e.startDate) >= new Date())
    const pastEvents = events.filter(e => new Date(e.startDate) < new Date())

    return (
        <main className={styles.main}>
            <div className={styles.pageHeader}>
                <h2>Innovation Events</h2>
                <p>Workshops, competitions, exhibitions, and innovation-focused gatherings.</p>
            </div>

            {upcomingEvents.length > 0 && (
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Upcoming Events</h3>
                    <div className={styles.eventsGrid}>
                        {upcomingEvents.map((event, index) => (
                            <Link href={`/events/${event.id}`} key={event.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className={`${styles.eventCard} ${styles[`animateDelay${index + 1}`] || ''}`}>
                                    <div className={styles.eventDate}>
                                        <div className={styles.eventMonth}>
                                            {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                                        </div>
                                        <div className={styles.eventDay}>
                                            {new Date(event.startDate).getDate()}
                                        </div>
                                    </div>
                                    <div className={styles.eventContent}>
                                        <span className={styles.eventCategory}>{event.category}</span>
                                        <h4 className={styles.eventTitle}>{event.title}</h4>
                                        <p className={styles.eventDesc}>{event.description}</p>
                                        <div className={styles.eventMeta}>
                                            {event.location && (
                                                <span>
                                                    <i className="fa fa-map-marker"></i> {event.location}
                                                </span>
                                            )}
                                            <span>
                                                <i className="fa fa-users"></i> {event.registrationCount} registered
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {pastEvents.length > 0 && (
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Past Events</h3>
                    <div className={styles.eventsGrid}>
                        {pastEvents.slice(0, 6).map((event) => (
                            <Link href={`/events/${event.id}`} key={event.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className={`${styles.eventCard} ${styles.pastEvent} `}>
                                    <div className={styles.eventDate}>
                                        <div className={styles.eventMonth}>
                                            {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                                        </div>
                                        <div className={styles.eventDay}>
                                            {new Date(event.startDate).getDate()}
                                        </div>
                                    </div>
                                    <div className={styles.eventContent}>
                                        <span className={styles.eventCategory}>{event.category}</span>
                                        <h4 className={styles.eventTitle}>{event.title}</h4>
                                        <p className={styles.eventDesc}>{event.description.substring(0, 100)}...</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {events.length === 0 && (
                <p className={styles.emptyState}>No events scheduled at the moment.</p>
            )}
        </main>
    )
}
