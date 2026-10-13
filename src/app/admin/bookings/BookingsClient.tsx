'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../admin.module.css'
import { approveBooking, rejectBooking, cancelBooking, completeBooking } from '@/actions/bookings'
import AdminNav from '@/components/AdminNav'
import ExportButton from '@/components/ExportButton'

interface Booking {
    id: string
    labName: string
    userName: string
    militaryId: string
    isBorrow: boolean
    bookingDate: string
    returnDate: string
    returnNote: string
    timeSlot: string
    purpose: string
    status: string
}

interface BookingsClientProps {
    initialBookings: Booking[]
    today: string
}

const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED']

function formatDate(value: string) {
    if (!value) return ''
    const [y, m, d] = value.slice(0, 10).split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getStatusColor(status: string) {
    switch (status) {
        case 'PENDING': return '#b45309'
        case 'APPROVED': return '#047857'
        case 'REJECTED': return '#b91c1c'
        case 'COMPLETED': return '#1d4ed8'
        default: return '#4b5563'
    }
}

export default function BookingsClient({ initialBookings, today }: BookingsClientProps) {
    const router = useRouter()
    const [filter, setFilter] = useState('all')
    const [loading, setLoading] = useState<string | null>(null)
    const [completing, setCompleting] = useState<Booking | null>(null)
    const [note, setNote] = useState('')
    const [dialogError, setDialogError] = useState('')

    const isOverdue = (b: Booking) => b.isBorrow && b.status === 'APPROVED' && !!b.returnDate && b.returnDate < today
    const overdueCount = initialBookings.filter(isOverdue).length

    const filteredBookings = filter === 'all'
        ? initialBookings
        : filter === 'OVERDUE'
            ? initialBookings.filter(isOverdue)
            : initialBookings.filter(b => b.status === filter)

    const handleAction = async (action: 'approve' | 'reject' | 'cancel', booking: Booking) => {
        if (action === 'cancel' && !confirm(`Cancel ${booking.userName}'s booking for ${booking.labName}?`)) return
        setLoading(booking.id)
        const run = action === 'approve' ? approveBooking : action === 'reject' ? rejectBooking : cancelBooking
        const result = await run(booking.id).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        setLoading(null)
        if ('error' in result && result.error) alert(result.error)
        router.refresh()
    }

    const openComplete = (booking: Booking) => {
        setCompleting(booking)
        setNote('')
        setDialogError('')
    }

    const submitComplete = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!completing) return
        setLoading(completing.id)
        const result = await completeBooking(completing.id, note).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        setLoading(null)
        if ('error' in result && result.error) {
            setDialogError(result.error)
            return
        }
        setCompleting(null)
        router.refresh()
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>Booking Management</h2>
                <p>Review requests, track borrowed items and record returns</p>
            </div>

            <AdminNav />

            <div className={styles.exportRow}>
                <ExportButton kind="bookings" label="Export bookings" />
            </div>

            <div className={styles.filterBar}>
                <button
                    className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({initialBookings.length})
                </button>
                {STATUSES.map(status => (
                    <button
                        key={status}
                        className={`${styles.filterBtn} ${filter === status ? styles.active : ''}`}
                        onClick={() => setFilter(status)}
                    >
                        {status} ({initialBookings.filter(b => b.status === status).length})
                    </button>
                ))}
                <button
                    className={`${styles.filterBtn} ${filter === 'OVERDUE' ? styles.active : ''}`}
                    onClick={() => setFilter('OVERDUE')}
                >
                    OVERDUE ({overdueCount})
                </button>
            </div>

            <div className={styles.section}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>User</th>
                                <th>Date</th>
                                <th>Time Slot</th>
                                <th>Purpose</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                                        No bookings found.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map(booking => (
                                    <tr key={booking.id}>
                                        <td>
                                            <strong>{booking.labName}</strong>
                                            {booking.isBorrow && <><br /><small style={{ color: '#718096' }}>Borrowed item</small></>}
                                        </td>
                                        <td>
                                            {booking.userName}<br />
                                            <small style={{ color: '#718096' }}>{booking.militaryId}</small>
                                        </td>
                                        <td>
                                            {formatDate(booking.bookingDate)}
                                            {booking.isBorrow && booking.returnDate && (
                                                <>
                                                    <br />
                                                    <small style={{ color: isOverdue(booking) ? '#b91c1c' : '#718096', fontWeight: isOverdue(booking) ? 700 : 400 }}>
                                                        Return by {formatDate(booking.returnDate)}
                                                    </small>
                                                </>
                                            )}
                                        </td>
                                        <td>{booking.timeSlot}</td>
                                        <td style={{ maxWidth: '220px', overflowWrap: 'anywhere' }}>
                                            {booking.purpose || '-'}
                                            {booking.returnNote && (
                                                <><br /><small style={{ color: '#718096' }}>Return note: {booking.returnNote}</small></>
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className={styles.statusBadge}
                                                style={{ background: getStatusColor(booking.status), color: 'white' }}
                                            >
                                                {booking.isBorrow && booking.status === 'COMPLETED' ? 'RETURNED' : booking.status}
                                            </span>
                                            {isOverdue(booking) && (
                                                <span className={styles.statusBadge} style={{ background: '#b91c1c', color: 'white', marginTop: '0.35rem' }}>
                                                    OVERDUE
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.actionBtns}>
                                                {booking.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            className={styles.approveBtn}
                                                            onClick={() => handleAction('approve', booking)}
                                                            disabled={loading === booking.id}
                                                        >
                                                            <i className="fa fa-check"></i> Approve
                                                        </button>
                                                        <button
                                                            className={styles.rejectBtn}
                                                            onClick={() => handleAction('reject', booking)}
                                                            disabled={loading === booking.id}
                                                        >
                                                            <i className="fa fa-times"></i> Reject
                                                        </button>
                                                    </>
                                                )}
                                                {booking.status === 'APPROVED' && (
                                                    <button
                                                        className={styles.completeBtn}
                                                        onClick={() => openComplete(booking)}
                                                        disabled={loading === booking.id}
                                                    >
                                                        <i className="fa fa-check-double"></i> {booking.isBorrow ? 'Mark returned' : 'Complete'}
                                                    </button>
                                                )}
                                                {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                                                    <button
                                                        className={styles.cancelBtn}
                                                        onClick={() => handleAction('cancel', booking)}
                                                        disabled={loading === booking.id}
                                                        aria-label="Cancel booking"
                                                        title="Cancel booking"
                                                    >
                                                        <i className="fa fa-ban"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {completing && (
                <div className={styles.modalOverlay} onClick={() => setCompleting(null)}>
                    <div className={styles.modalBox} role="dialog" aria-modal="true" aria-labelledby="complete-title" onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHead}>
                            <h3 id="complete-title">{completing.isBorrow ? 'Record return' : 'Complete booking'}</h3>
                            <button type="button" className={styles.modalClose} onClick={() => setCompleting(null)} aria-label="Close"><i className="fa fa-times"></i></button>
                        </div>
                        <form onSubmit={submitComplete} className={styles.modalBody}>
                            <p className={styles.hint}>
                                {completing.labName} · {completing.userName} · {formatDate(completing.bookingDate)}
                                {completing.isBorrow && completing.returnDate ? ` to ${formatDate(completing.returnDate)}` : ''}
                            </p>
                            <label className={styles.field}>
                                <span>{completing.isBorrow ? 'Condition on return' : 'Notes (optional)'}</span>
                                <textarea
                                    rows={3}
                                    maxLength={500}
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    placeholder={completing.isBorrow ? 'e.g. Returned complete and working / Missing charger' : 'Anything worth recording about this session'}
                                />
                            </label>
                            {dialogError && <div className={styles.formError}>{dialogError}</div>}
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => setCompleting(null)}>Cancel</button>
                                <button type="submit" className={styles.primaryBtn} disabled={loading === completing.id}>
                                    {loading === completing.id ? 'Saving...' : completing.isBorrow ? 'Mark as returned' : 'Mark as completed'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
