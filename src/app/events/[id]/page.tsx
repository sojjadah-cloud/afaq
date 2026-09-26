import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import styles from './page.module.css'
import { RowDataPacket } from '@/lib/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import EventActions from './EventActions'

export const dynamic = 'force-dynamic'

interface Event extends RowDataPacket {
    id: string
    title: string
    description: string
    category: string
    startDate: Date
    endDate: Date
    location: string
    capacity: number
    createdById: string
    registrationCount: number
}

interface Registration extends RowDataPacket {
    status: string
}

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getSession()

    const events = await query<Event[]>(`
        SELECT 
            e.*,
            (SELECT COUNT(*) FROM event_registrations er WHERE er.eventId = e.id AND er.status != 'CANCELLED') as registrationCount
        FROM events e
        WHERE e.id = ?
    `, [id])

    const event = events[0]
    if (!event) notFound()

    // Check user registration
    let isRegistered = false
    let registrationStatus = ''

    if (session.isLoggedIn) {
        const registration = await query<Registration[]>(
            'SELECT status FROM event_registrations WHERE eventId = ? AND userId = ?',
            [id, session.userId]
        )
        if (registration.length > 0) {
            isRegistered = true
            registrationStatus = registration[0].status
        }
    }

    const isFull = event.capacity ? event.registrationCount >= event.capacity : false
    const isPast = new Date(event.startDate) < new Date()

    return (
        <main className={styles.main}>
            <Link href="/events" className={styles.backLink}>
                <i className="fa fa-arrow-left"></i> Back to Events
            </Link>

            <div className={styles.eventContainer}>
                <div className={styles.mainContent}>
                    <div className={styles.eventHeader}>
                        <span className={styles.eventCategory}>{event.category}</span>
                        <h1 className={styles.eventTitle}>{event.title}</h1>

                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <div className={styles.detailIcon}>
                                    <i className="fa-regular fa-calendar"></i>
                                </div>
                                <div className={styles.detailText}>
                                    <h4>Date</h4>
                                    <p>{new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className={styles.detailItem}>
                                <div className={styles.detailIcon}>
                                    <i className="fa-regular fa-clock"></i>
                                </div>
                                <div className={styles.detailText}>
                                    <h4>Time</h4>
                                    <p>{new Date(event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>

                            <div className={styles.detailItem}>
                                <div className={styles.detailIcon}>
                                    <i className="fa-solid fa-location-dot"></i>
                                </div>
                                <div className={styles.detailText}>
                                    <h4>Location</h4>
                                    <p>{event.location || 'TBD'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.contentSection}>
                        <div className={styles.description}>
                            <MarkdownRenderer content={event.description} />
                        </div>
                    </div>
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.actionCard}>
                        <h3 className={styles.actionTitle}>Registration</h3>

                        {!session.isLoggedIn ? (
                            <Link href="/login" className={styles.registerBtn}>
                                Login to Register
                            </Link>
                        ) : (
                            <EventActions
                                eventId={event.id}
                                isRegistered={isRegistered}
                                registrationStatus={registrationStatus}
                                isFull={isFull}
                                isPast={isPast}
                            />
                        )}

                        <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                            <p style={{ color: '#718096', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Capacity:</span>
                                <strong>{event.capacity ? `${event.registrationCount} / ${event.capacity}` : 'Unlimited'}</strong>
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    )
}
