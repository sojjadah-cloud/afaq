'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../admin.module.css'
import { createEvent, updateEvent, deleteEvent, getEventRegistrations } from '@/actions/events'
import AdminNav from '@/components/AdminNav'

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

interface Registration {
    id: string
    userName: string
    militaryId: string
    email: string
    status: string
    registeredAt: string
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
    const [showRegistrations, setShowRegistrations] = useState(false)
    const [registrations, setRegistrations] = useState<Registration[]>([])
    const [viewingEvent, setViewingEvent] = useState<Event | null>(null)
    const [mounted, setMounted] = useState(false)

    // Fix hydration mismatch by only using Date after mount
    useEffect(() => {
        setMounted(true)
    }, [])

    const now = mounted ? new Date() : new Date(0)
    const filteredEvents = events.filter(e => {
        if (!mounted) return true // Show all on server
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

    const viewRegistrations = async (event: Event) => {
        setLoading(event.id + '_regs')
        setViewingEvent(event)
        const regs = await getEventRegistrations(event.id)
        setRegistrations(regs as Registration[])
        setShowRegistrations(true)
        setLoading(null)
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

            <AdminNav />

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
                                            {mounted && (
                                                <small style={{ color: new Date(event.startDate) < now ? '#ef4444' : '#10b981' }}>
                                                    {new Date(event.startDate) < now ? 'Past' : 'Upcoming'}
                                                </small>
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
                                                        {event.capacity && ` / ${event.capacity}`}
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
                        zIndex: 1000, padding: '2rem'
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
                            padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0',
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
                                onClick={() => { setShowRegistrations(false); setViewingEvent(null) }}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer' }}
                            >
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem 2rem' }}>
                            {registrations.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                    <i className="fa fa-users" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}></i>
                                    No registrations yet.
                                </div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#475569' }}>Name</th>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#475569' }}>Military ID</th>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#475569' }}>Status</th>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#475569' }}>Registered</th>
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
                                                    {new Date(reg.registeredAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#64748b' }}>
                                    <strong>{registrations.filter(r => r.status === 'REGISTERED').length}</strong> active registrations
                                    {viewingEvent.capacity && ` out of ${viewingEvent.capacity} capacity`}
                                </span>
                                {registrations.length > 0 && (
                                    <button
                                        onClick={async () => {
                                            setLoading('export')
                                            const { exportEventRegistrationsCSV } = await import('@/actions/export')
                                            const result = await exportEventRegistrationsCSV(viewingEvent.id, viewingEvent.title)
                                            if (result.csv) {
                                                const blob = new Blob([result.csv], { type: 'text/csv' })
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
