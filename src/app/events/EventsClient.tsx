'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { createEvent } from '@/actions/events'
import EventCalendar, { CalendarEventItem } from './EventCalendar'
import { EVENT_TYPES, EVENT_TYPE_KEYS } from '@/lib/eventTypes'

interface EventsClientProps {
    events: CalendarEventItem[]
    canCreate: boolean
    today: string
}

export default function EventsClient({ events, canCreate, today }: EventsClientProps) {
    const router = useRouter()
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        const formData = new FormData(e.currentTarget)
        const result = await createEvent(formData)

        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: 'Event created successfully!' })
            setShowForm(false)
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <main className={styles.main}>
            <div className={styles.pageHeader}>
                <div>
                    <h2>Events Calendar</h2>
                    <p>Club activities, student activities, events at Omani universities and colleges, and conferences.</p>
                </div>
                {canCreate && (
                    <button className={styles.createBtn} onClick={() => setShowForm(true)}>
                        <i className="fa fa-plus"></i> Create Event
                    </button>
                )}
            </div>

            {/* Success/Error Message */}
            {message.text && (
                <div className={`${styles.toast} ${styles[message.type]}`}>
                    <i className={`fa ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                    {message.text}
                </div>
            )}

            {events.length === 0 ? (
                <div className={styles.emptyState}>
                    <i className="fa fa-calendar-xmark" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}></i>
                    <p>No events scheduled at the moment.</p>
                    {canCreate && (
                        <button className={styles.createBtn} onClick={() => setShowForm(true)}>
                            <i className="fa fa-plus"></i> Create First Event
                        </button>
                    )}
                </div>
            ) : (
                <EventCalendar events={events} today={today} />
            )}

            {/* Create Event Modal */}
            {showForm && (
                <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Create New Event</h3>
                            <button className={styles.closeBtn} onClick={() => setShowForm(false)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="title">Event Title *</label>
                                <input type="text" id="title" name="title" required placeholder="Enter event title" />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="eventType">Event Type *</label>
                                <select id="eventType" name="eventType" required defaultValue="CLUB">
                                    {EVENT_TYPE_KEYS.map(t => (
                                        <option key={t} value={t}>{EVENT_TYPES[t].label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="category">Format</label>
                                    <select id="category" name="category">
                                        <option value="Workshop">Workshop</option>
                                        <option value="Competition">Competition</option>
                                        <option value="Exhibition">Exhibition</option>
                                        <option value="Seminar">Seminar</option>
                                        <option value="Conference">Conference</option>
                                        <option value="Training">Training</option>
                                        <option value="Networking">Networking</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="capacity">Capacity</label>
                                    <input type="number" id="capacity" name="capacity" min={1} step={1} placeholder="Leave empty for unlimited" />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="startDate">Start Date & Time *</label>
                                    <input type="datetime-local" id="startDate" name="startDate" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="endDate">End Date & Time</label>
                                    <input type="datetime-local" id="endDate" name="endDate" />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="registrationDeadline">Registration closes</label>
                                <input type="datetime-local" id="registrationDeadline" name="registrationDeadline" />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="location">Location</label>
                                <input type="text" id="location" name="location" placeholder="e.g., Innovation Lab, Building A" />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    placeholder="Describe the event, what participants will learn or experience..."
                                ></textarea>
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? (
                                        <><i className="fa fa-spinner fa-spin"></i> Creating...</>
                                    ) : (
                                        <><i className="fa fa-check"></i> Create Event</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
