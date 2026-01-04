'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../admin.module.css'
import { approveBooking, rejectBooking, cancelBooking, completeBooking } from '@/actions/bookings'

interface Booking {
    id: string
    labName: string
    userName: string
    militaryId: string
    bookingDate: Date
    timeSlot: string
    purpose: string
    status: string
    createdAt: Date
}

interface BookingsClientProps {
    initialBookings: Booking[]
}

export default function BookingsClient({ initialBookings }: BookingsClientProps) {
    const router = useRouter()
    const [filter, setFilter] = useState('all')
    const [loading, setLoading] = useState<string | null>(null)

    const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED']

    const filteredBookings = filter === 'all'
        ? initialBookings
        : initialBookings.filter(b => b.status === filter)

    const handleAction = async (action: 'approve' | 'reject' | 'cancel' | 'complete', bookingId: string) => {
        setLoading(bookingId)

        let result
        switch (action) {
            case 'approve':
                result = await approveBooking(bookingId)
                break
            case 'reject':
                result = await rejectBooking(bookingId)
                break
            case 'cancel':
                result = await cancelBooking(bookingId)
                break
            case 'complete':
                result = await completeBooking(bookingId)
                break
        }

        if (result.error) {
            alert(result.error)
        }

        setLoading(null)
        router.refresh()
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return '#f59e0b'
            case 'APPROVED': return '#10b981'
            case 'REJECTED': return '#ef4444'
            case 'COMPLETED': return '#3b82f6'
            case 'CANCELLED': return '#6b7280'
            default: return '#6b7280'
        }
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>Booking Management</h2>
                <p>Review and manage lab booking requests</p>
            </div>

            <div className={styles.filterBar}>
                <button
                    className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({initialBookings.length})
                </button>
                {statuses.map(status => {
                    const count = initialBookings.filter(b => b.status === status).length
                    return (
                        <button
                            key={status}
                            className={`${styles.filterBtn} ${filter === status ? styles.active : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {status} ({count})
                        </button>
                    )
                })}
            </div>

            <div className={styles.section}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Lab</th>
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
                                        <td><strong>{booking.labName}</strong></td>
                                        <td>
                                            {booking.userName}<br />
                                            <small style={{ color: '#718096' }}>{booking.militaryId}</small>
                                        </td>
                                        <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                        <td>{booking.timeSlot}</td>
                                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {booking.purpose || '-'}
                                        </td>
                                        <td>
                                            <span
                                                className={styles.statusBadge}
                                                style={{ background: getStatusColor(booking.status), color: 'white' }}
                                            >
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actionBtns}>
                                                {booking.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            className={styles.approveBtn}
                                                            onClick={() => handleAction('approve', booking.id)}
                                                            disabled={loading === booking.id}
                                                        >
                                                            <i className="fa fa-check"></i> Approve
                                                        </button>
                                                        <button
                                                            className={styles.rejectBtn}
                                                            onClick={() => handleAction('reject', booking.id)}
                                                            disabled={loading === booking.id}
                                                        >
                                                            <i className="fa fa-times"></i> Reject
                                                        </button>
                                                    </>
                                                )}
                                                {booking.status === 'APPROVED' && (
                                                    <button
                                                        className={styles.completeBtn}
                                                        onClick={() => handleAction('complete', booking.id)}
                                                        disabled={loading === booking.id}
                                                    >
                                                        <i className="fa fa-check-double"></i> Complete
                                                    </button>
                                                )}
                                                {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                                                    <button
                                                        className={styles.cancelBtn}
                                                        onClick={() => handleAction('cancel', booking.id)}
                                                        disabled={loading === booking.id}
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
        </main>
    )
}
