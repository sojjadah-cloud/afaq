'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../admin.module.css'
import { createEvent, updateEvent, deleteEvent, getEventRegistrations, setAttendance } from '@/actions/events'
import AdminNav from '@/components/AdminNav'
import ExportButton from '@/components/ExportButton'
import { EVENT_TYPES, EVENT_TYPE_KEYS, eventTypeOf } from '@/lib/eventTypes'
import { eventStatus, minute, EVENT_STATUS_LABELS, EventStatus } from '@/lib/eventStatus'

const STATUS_COLORS: Record<EventStatus, string> = {
    OPEN: '#047857',
    FULL: '#b45309',
    CLOSED: '#4b5563',
    ONGOING: '#1d4ed8',
    FINISHED: '#64748b',
}

interface Event {
    id: string
    title: string
    description: string
    category: string
    eventType: string
    startDate: string
    endDate: string
    registrationDeadline: string | null
    location: string
    capacity: number
    registrationCount: number
}

interface Registration {
    id: string
    userName: string
    militaryId: string
    email: string
    status: string
    registeredAt: string
    attended: number
}

interface EventsManagementClientProps {
    events: Event[]
    now: string
}

export default function EventsManagementClient({ events, now }: EventsManagementClientProps) {
    const router = useRouter()
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')
    const [loading, setLoading] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [editEvent, setEditEvent] = useState<Event | null>(null)
    const [showRegistrations, setShowRegistrations] = useState(false)
    const [registrations, setRegistrations] = useState<Registration[]>([])
    const [viewingEvent, setViewingEvent] = useState<Event | null>(null)
    const [formError, setFormError] = useState('')

    // "now" comes from the server in Oman time, so server and client render the same statuses.
    const statusOf = (e: Event) => eventStatus(e, Number(e.registrationCount) || 0, now)
    const isPast = (e: Event) => statusOf(e) === 'FINISHED'
    const filteredEvents = events.filter(e => {
        if (filter === 'upcoming') return !isPast(e)
        if (filter === 'past') return isPast(e)
        return true
    })
    const viewingStarted = viewingEvent ? now >= minute(viewingEvent.startDate) : false

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading('form')
        setFormError('')
        const formData = new FormData(e.currentTarget)

        const result = await (editEvent ? updateEvent(editEvent.id, formData) : createEvent(formData))
            .catch(() => ({ error: 'Something went wrong. Please try again.' }))

        if ('error' in result && result.error) {
            setFormError(result.error)
        } else {
            setShowForm(false)
            setEditEvent(null)
            router.refresh()
        }
        setLoading(null)
    }

    const handleDelete = async (eventId: string, eventTitle: string) => {
        if (!confirm(`Delete event "${eventTitle}"? This will also remove all registrations.`)) return
        setLoading(eventId)
        const result = await deleteEvent(eventId)
        if (result.error) {
            alert(result.error)
        }
        setLoading(null)
        router.refresh()
    }

    const openEditForm = (event: Event) => {
        setFormError('')
        setEditEvent(event)
        setShowForm(true)
    }

    const toggleAttendance = async (reg: Registration) => {
        setLoading(reg.id)
        const next = !Number(reg.attended)
        const result = await setAttendance(reg.id, next).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        setLoading(null)
        if ('error' in result && result.error) {
            alert(result.error)
            return
        }
        setRegistrations(list => list.map(r => (r.id === reg.id ? { ...r, attended: next ? 1 : 0 } : r)))
        router.refresh()
    }

    const viewRegistrations = async (event: Event) => {
        setLoading(event.id + '_regs')
        setViewingEvent(event)
        const regs = await getEventRegistrations(event.id)
        setRegistrations(regs as Registration[])
        setShowRegistrations(true)
        setLoading(null)
    }

    const formatDate = (dateStr: string) => {
        const [y, m, d] = String(dateStr).slice(0, 10).split('-').map(Number)
        return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    // Stored values are local wall-clock times; keep them as-is (no UTC conversion).
    const formatDateTimeLocal = (dateStr: string) => {
        if (!dateStr) return ''
        return String(dateStr).replace(' ', 'T').slice(0, 16)
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>Events Management</h2>
                <p>Create, edit, and manage all events</p>
            </div>

            <AdminNav />

            <div className={styles.exportRow}>
                <ExportButton kind="events" label="Export events" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className={styles.filterBar}>
                    <button
                        className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({events.length})
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'upcoming' ? styles.active : ''}`}
                        onClick={() => setFilter('upcoming')}
                    >
                        Upcoming ({events.filter(e => !isPast(e)).length})
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'past' ? styles.active : ''}`}
                        onClick={() => setFilter('past')}
                    >
                        Past ({events.filter(isPast).length})
                    </button>
                </div>
                <button
                    className={styles.approveBtn}
                    style={{ padding: '0.75rem 1.5rem' }}
                    onClick={() => { setFormError(''); setEditEvent(null); setShowForm(true) }}
                >
                    <i className="fa fa-plus"></i> New Event
                </button>
            </div>

            <div className={styles.section}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Location</th>
                                <th>Registrations</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                        No events found.
                                    </td>
                                </tr>
                            ) : (
                                filteredEvents.map(event => (
                                    <tr key={event.id}>
                                        <td>
                                            <strong>{event.title}</strong>
                                            <br />
                                            <small style={{ color: '#64748b' }}>
                                                {event.description ? (event.description.length > 60 ? `${event.description.slice(0, 60)}...` : event.description) : ''}
                                            </small>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap',
                                                background: EVENT_TYPES[eventTypeOf(event.eventType)].bg,
                                                color: EVENT_TYPES[eventTypeOf(event.eventType)].color
                                            }}>
                                                {EVENT_TYPES[eventTypeOf(event.eventType)].label}
                                            </span>
                                            <br />
                                            <small style={{ color: '#64748b' }}>{event.category}</small>
                                        </td>
                                        <td>
                                            {formatDate(event.startDate)}
                                            <br />
                                            <small style={{ color: STATUS_COLORS[statusOf(event)], fontWeight: 600 }}>
                                                {EVENT_STATUS_LABELS[statusOf(event)]}
                                            </small>
                                            {event.registrationDeadline && statusOf(event) === 'OPEN' && (
                                                <><br /><small style={{ color: '#64748b' }}>Closes {formatDate(event.registrationDeadline)}</small></>
                                            )}
                                        </td>
                                        <td>{event.location || '-'}</td>
                                        <td>
                                            <button
                                                onClick={() => viewRegistrations(event)}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    color: '#1d4ed8', fontWeight: 600, textDecoration: 'underline'
                                                }}
                                                disabled={loading === event.id + '_regs'}
                                            >
                                                {loading === event.id + '_regs' ? '...' : (
                                                    <>
                                                        <strong>{event.registrationCount}</strong>
                                                        {event.capacity ? ` / ${event.capacity}` : ''}
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td>
                                            <div className={styles.actionBtns}>
                                                <Link href={`/events/${event.id}`} className={styles.viewBtn} title="View">
                                                    <i className="fa fa-eye"></i>
                                                </Link>
                                                <button
                                                    className={styles.completeBtn}
                                                    onClick={() => openEditForm(event)}
                                                    title="Edit"
                                                >
                                                    <i className="fa fa-edit"></i>
                                                </button>
                                                <button
                                                    className={styles.rejectBtn}
                                                    onClick={() => handleDelete(event.id, event.title)}
                                                    disabled={loading === event.id}
                                                    title="Delete"
                                                >
                                                    <i className="fa fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registrations Modal */}
            {showRegistrations && viewingEvent && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000, padding: '1rem'
                    }}
                    onClick={() => { setShowRegistrations(false); setViewingEvent(null) }}
                >
                    <div
                        style={{
                            background: 'white', borderRadius: '20px', maxWidth: '700px', width: '100%',
                            maxHeight: '80vh', overflow: 'auto'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '1.25rem clamp(1rem, 4vw, 2rem)', borderBottom: '1px solid #e2e8f0',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'linear-gradient(135deg, #fffbef, white)', borderRadius: '20px 20px 0 0'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, color: '#1e293b' }}>Registered Users</h3>
                                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                                    {viewingEvent.title}
                                </p>
                            </div>
                            <button
                                aria-label="Close"
                                onClick={() => { setShowRegistrations(false); setViewingEvent(null) }}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer' }}
                            >
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        <div style={{ padding: '1.25rem clamp(1rem, 4vw, 2rem)' }}>
                            {!viewingStarted && registrations.length > 0 && (
                                <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.9rem' }}>
                                    Attendance can be recorded once the event starts.
                                </p>
                            )}
                            {registrations.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                    <i className="fa fa-users" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}></i>
                                    No registrations yet.
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#475569' }}>Name</th>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#475569' }}>Military ID</th>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#475569' }}>Status</th>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#475569' }}>Registered</th>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#475569' }}>Attended</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registrations.map(reg => (
                                            <tr key={reg.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <strong>{reg.userName}</strong>
                                                    <br />
                                                    <small style={{ color: '#64748b' }}>{reg.email}</small>
                                                </td>
                                                <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{reg.militaryId}</td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 600,
                                                        background: reg.status === 'REGISTERED' ? '#dcfce7' : '#fee2e2',
                                                        color: reg.status === 'REGISTERED' ? '#16a34a' : '#dc2626'
                                                    }}>
                                                        {reg.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                                                    {formatDate(reg.registeredAt)}
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    {reg.status === 'REGISTERED' ? (
                                                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: viewingStarted ? 'pointer' : 'not-allowed' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={!!Number(reg.attended)}
                                                                disabled={!viewingStarted || loading === reg.id}
                                                                onChange={() => toggleAttendance(reg)}
                                                                style={{ width: '18px', height: '18px' }}
                                                            />
                                                            <span style={{ fontSize: '0.85rem', color: '#475569' }}>{Number(reg.attended) ? 'Yes' : 'No'}</span>
                                                        </label>
                                                    ) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                </div>
                            )}
                            <div style={{ marginTop: '1.5rem', flexWrap: 'wrap', gap: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#64748b' }}>
                                    <strong>{registrations.filter(r => r.status === 'REGISTERED').length}</strong> active registrations
                                    {viewingEvent.capacity ? ` out of ${viewingEvent.capacity} capacity` : ''}
                                    {viewingStarted && <> · <strong>{registrations.filter(r => r.status === 'REGISTERED' && Number(r.attended)).length}</strong> attended</>}
                                </span>
                                {registrations.length > 0 && (
                                    <button
                                        onClick={async () => {
                                            setLoading('export')
                                            const { exportEventRegistrationsCSV } = await import('@/actions/export')
                                            const result = await exportEventRegistrationsCSV(viewingEvent.id, viewingEvent.title)
                                            if (result.csv) {
                                                const blob = new Blob(['\uFEFF' + result.csv], { type: 'text/csv;charset=utf-8' })
                                                const url = URL.createObjectURL(blob)
                                                const a = document.createElement('a')
                                                a.href = url
                                                a.download = result.filename || 'registrations.csv'
                                                a.click()
                                                URL.revokeObjectURL(url)
                                            } else if (result.error) {
                                                alert(result.error)
                                            }
                                            setLoading(null)
                                        }}
                                        disabled={loading === 'export'}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <i className={loading === 'export' ? 'fa fa-spinner fa-spin' : 'fa fa-download'}></i>
                                        {loading === 'export' ? 'Exporting...' : 'Export to Excel'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showForm && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000, padding: '1rem'
                    }}
                    onClick={() => { setShowForm(false); setEditEvent(null) }}
                >
                    <div
                        style={{
                            background: 'white', borderRadius: '20px', maxWidth: '600px', width: '100%',
                            maxHeight: '90vh', overflow: 'auto'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '1.25rem clamp(1rem, 4vw, 2rem)', borderBottom: '1px solid #e2e8f0',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'linear-gradient(135deg, #fffbef, white)', borderRadius: '20px 20px 0 0'
                        }}>
                            <h3 style={{ margin: 0, color: '#1e293b' }}>
                                {editEvent ? 'Edit Event' : 'Create Event'}
                            </h3>
                            <button
                                aria-label="Close"
                                onClick={() => { setShowForm(false); setEditEvent(null) }}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer' }}
                            >
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: 'clamp(1rem, 4vw, 2rem)' }}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Title *</label>
                                <input
                                    type="text" name="title" required
                                    defaultValue={editEvent?.title || ''}
                                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Event Type *</label>
                                <select
                                    name="eventType" required
                                    defaultValue={eventTypeOf(editEvent?.eventType)}
                                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' }}
                                >
                                    {EVENT_TYPE_KEYS.map(t => (
                                        <option key={t} value={t}>{EVENT_TYPES[t].label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGrid2}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Format</label>
                                    <select
                                        name="category"
                                        defaultValue={editEvent?.category || 'General'}
                                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' }}
                                    >
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
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Capacity</label>
                                    <input
                                        type="number" name="capacity" min={1} step={1}
                                        defaultValue={editEvent?.capacity || ''}
                                        placeholder="Unlimited"
                                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' }}
                                    />
                                </div>
                            </div>
                            <div className={styles.formGrid2}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Start Date *</label>
                                    <input
                                        type="datetime-local" name="startDate" required
                                        defaultValue={editEvent ? formatDateTimeLocal(editEvent.startDate) : ''}
                                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>End Date</label>
                                    <input
                                        type="datetime-local" name="endDate"
                                        defaultValue={editEvent?.endDate ? formatDateTimeLocal(editEvent.endDate) : ''}
                                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' }}
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label htmlFor="registrationDeadline" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Registration closes</label>
                                <input
                                    id="registrationDeadline" type="datetime-local" name="registrationDeadline"
                                    defaultValue={editEvent?.registrationDeadline ? formatDateTimeLocal(editEvent.registrationDeadline) : ''}
                                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' }}
                                />
                                <small style={{ color: '#64748b' }}>Optional. If empty, registration stays open until the event starts.</small>
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Location</label>
                                <input
                                    type="text" name="location"
                                    defaultValue={editEvent?.location || ''}
                                    placeholder="e.g., Innovation Lab, Building A"
                                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Description</label>
                                <textarea
                                    name="description" rows={4}
                                    defaultValue={editEvent?.description || ''}
                                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', fontFamily: 'inherit' }}
                                ></textarea>
                            </div>
                            {formError && <div className={styles.formError} role="alert" style={{ marginBottom: '1rem' }}>{formError}</div>}
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); setEditEvent(null) }}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', background: '#f1f5f9', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading === 'form'}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', background: 'var(--gold)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    {loading === 'form' ? 'Saving...' : editEvent ? 'Update Event' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
