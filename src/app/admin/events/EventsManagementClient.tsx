'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../admin.module.css'
import { createEvent, updateEvent, deleteEvent } from '@/actions/events'

interface Event {
    id: string
    title: string
    description: string
    category: string
    startDate: string
    endDate: string
    location: string
    capacity: number
    registrationCount: number
}

interface EventsManagementClientProps {
    events: Event[]
}

export default function EventsManagementClient({ events }: EventsManagementClientProps) {
    const router = useRouter()
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')
    const [loading, setLoading] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [editEvent, setEditEvent] = useState<Event | null>(null)

    const now = new Date()
    const filteredEvents = events.filter(e => {
        if (filter === 'upcoming') return new Date(e.startDate) >= now
        if (filter === 'past') return new Date(e.startDate) < now
        return true
    })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading('form')
        const formData = new FormData(e.currentTarget)

        let result
        if (editEvent) {
            result = await updateEvent(editEvent.id, formData)
        } else {
            result = await createEvent(formData)
        }

        if (result.error) {
            alert(result.error)
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
        setEditEvent(event)
        setShowForm(true)
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        })
    }

    const formatDateTimeLocal = (dateStr: string) => {
        if (!dateStr) return ''
        const d = new Date(dateStr)
        return d.toISOString().slice(0, 16)
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>Events Management</h2>
                <p>Create, edit, and manage all events</p>
            </div>

            <div className={styles.adminNav}>
                <Link href="/admin" className={styles.navLink}>
                    <i className="fa fa-chart-simple"></i> Overview
                </Link>
                <Link href="/admin/bookings" className={styles.navLink}>
                    <i className="fa fa-calendar-check"></i> Bookings
                </Link>
                <Link href="/admin/requests" className={styles.navLink}>
                    <i className="fa fa-inbox"></i> Requests
                </Link>
                <Link href="/admin/events" className={`${styles.navLink} ${styles.active}`}>
                    <i className="fa fa-calendar-days"></i> Events
                </Link>
                <Link href="/admin/analytics" className={styles.navLink}>
                    <i className="fa fa-chart-pie"></i> Analytics
                </Link>
                <Link href="/admin/audit" className={styles.navLink}>
                    <i className="fa fa-clipboard-list"></i> Audit Log
                </Link>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
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
                        Upcoming ({events.filter(e => new Date(e.startDate) >= now).length})
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'past' ? styles.active : ''}`}
                        onClick={() => setFilter('past')}
                    >
                        Past ({events.filter(e => new Date(e.startDate) < now).length})
                    </button>
                </div>
                <button
                    className={styles.approveBtn}
                    style={{ padding: '0.75rem 1.5rem' }}
                    onClick={() => { setEditEvent(null); setShowForm(true) }}
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
                                <th>Category</th>
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
                                                {event.description?.substring(0, 50)}...
                                            </small>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                background: '#eff6ff',
                                                color: '#1d4ed8'
                                            }}>
                                                {event.category}
                                            </span>
                                        </td>
                                        <td>
                                            {formatDate(event.startDate)}
                                            <br />
                                            <small style={{ color: new Date(event.startDate) < now ? '#ef4444' : '#10b981' }}>
                                                {new Date(event.startDate) < now ? 'Past' : 'Upcoming'}
                                            </small>
                                        </td>
                                        <td>{event.location || '-'}</td>
                                        <td>
                                            <strong>{event.registrationCount}</strong>
                                            {event.capacity && ` / ${event.capacity}`}
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

            {/* Create/Edit Modal */}
            {showForm && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000, padding: '2rem'
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
                            padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'linear-gradient(135deg, #fffbef, white)', borderRadius: '20px 20px 0 0'
                        }}>
                            <h3 style={{ margin: 0, color: '#1e293b' }}>
                                {editEvent ? 'Edit Event' : 'Create Event'}
                            </h3>
                            <button
                                onClick={() => { setShowForm(false); setEditEvent(null) }}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer' }}
                            >
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Title *</label>
                                <input
                                    type="text" name="title" required
                                    defaultValue={editEvent?.title || ''}
                                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Category</label>
                                    <select
                                        name="category"
                                        defaultValue={editEvent?.category || 'General'}
                                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' }}
                                    >
                                        <option value="Workshop">Workshop</option>
                                        <option value="Competition">Competition</option>
                                        <option value="Exhibition">Exhibition</option>
                                        <option value="Seminar">Seminar</option>
                                        <option value="Training">Training</option>
                                        <option value="Networking">Networking</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Capacity</label>
                                    <input
                                        type="number" name="capacity"
                                        defaultValue={editEvent?.capacity || ''}
                                        placeholder="Unlimited"
                                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
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
