'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { createEvent } from '@/actions/events'
import EventCalendar, { CalendarEventItem } from './EventCalendar'
import { EVENT_TYPES, EVENT_TYPE_KEYS } from '@/lib/eventTypes'
import { useT } from '@/i18n/client'

interface EventsClientProps {
    events: CalendarEventItem[]
    canCreate: boolean
    today: string
}

export default function EventsClient({ events, canCreate, today }: EventsClientProps) {
    const router = useRouter()
    const t = useT()
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        const formData = new FormData(e.currentTarget)
        const result = await createEvent(formData).catch(() => ({ error: 'Something went wrong. Please try again.' }))

        if ('error' in result && result.error) {
            setMessage({ type: 'error', text: t(result.error) })
        } else {
            setMessage({ type: 'success', text: t('Event created successfully!') })
            setShowForm(false)
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <main className={styles.main}>
            <div className={styles.pageHeader}>
                <div>
                    <h2>{t('Events Calendar')}</h2>
                    <p>{t('Club activities, student activities, events at Omani universities and colleges, and conferences.')}</p>
                </div>
                {canCreate && (
                    <button type="button" className={styles.createBtn} onClick={() => setShowForm(true)}>
                        <i className="fa fa-plus" aria-hidden="true"></i> {t('Create Event')}
                    </button>
                )}
            </div>

            {/* Success/Error Message */}
            {message.text && (
                <div className={`${styles.toast} ${styles[message.type]}`} role={message.type === 'error' ? 'alert' : 'status'}>
                    <i className={`fa ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} aria-hidden="true"></i>
                    {message.text}
                </div>
            )}

            {events.length === 0 ? (
                <div className={styles.emptyState}>
                    <i className="fa fa-calendar-xmark" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}></i>
                    <p>{t('No events scheduled at the moment.')}</p>
                    {canCreate && (
                        <button type="button" className={styles.createBtn} onClick={() => setShowForm(true)}>
                            <i className="fa fa-plus" aria-hidden="true"></i> {t('Create First Event')}
                        </button>
                    )}
                </div>
            ) : (
                <EventCalendar events={events} today={today} />
            )}

            {/* Create Event Modal */}
            {showForm && (
                <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
                    <div className={styles.modalContent} role="dialog" aria-modal="true" aria-labelledby="new-event-title" onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 id="new-event-title">{t('Create New Event')}</h3>
                            <button type="button" className={styles.closeBtn} onClick={() => setShowForm(false)} aria-label={t('Close')}>
                                <i className="fa fa-times" aria-hidden="true"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="title">{t('Event Title')} *</label>
                                <input type="text" id="title" name="title" required placeholder={t('Enter event title')} />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="eventType">{t('Event Type')} *</label>
                                <select id="eventType" name="eventType" required defaultValue="CLUB">
                                    {EVENT_TYPE_KEYS.map(type => (
                                        <option key={type} value={type}>{t(EVENT_TYPES[type].label)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="category">{t('Format')}</label>
                                    <select id="category" name="category">
                                        {['Workshop', 'Competition', 'Exhibition', 'Seminar', 'Conference', 'Training', 'Networking', 'General'].map(f => (
                                            <option key={f} value={f}>{t(f)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="capacity">{t('Capacity')}</label>
                                    <input type="number" id="capacity" name="capacity" min={1} step={1} placeholder={t('Leave empty for unlimited')} />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="startDate">{t('Start Date & Time')} *</label>
                                    <input type="datetime-local" id="startDate" name="startDate" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="endDate">{t('End Date & Time')}</label>
                                    <input type="datetime-local" id="endDate" name="endDate" />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="registrationDeadline">{t('Registration closes')}</label>
                                <input type="datetime-local" id="registrationDeadline" name="registrationDeadline" />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="location">{t('Location')}</label>
                                <input type="text" id="location" name="location" placeholder={t('e.g., Innovation Lab, Building A')} />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="description">{t('Description')}</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    placeholder={t('Describe the event, what participants will learn or experience...')}
                                ></textarea>
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setShowForm(false)}>{t('Cancel')}</button>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? (
                                        <><i className="fa fa-spinner fa-spin" aria-hidden="true"></i> {t('Creating...')}</>
                                    ) : (
                                        <><i className="fa fa-check" aria-hidden="true"></i> {t('Create Event')}</>
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
