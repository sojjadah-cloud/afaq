'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../admin.module.css'
import { updateRegistrationStatus } from '@/actions/club'
import { updateContactStatus } from '@/actions/contact'

interface Registration {
    id: string
    fullName: string
    email: string
    phone: string
    militaryId: string
    department: string
    yearLevel: string
    interests: string
    motivation: string
    status: string
    createdAt: string
}

interface ContactMessage {
    id: string
    name: string
    email: string
    phone: string
    subject: string
    message: string
    status: string
    createdAt: string
}

interface RequestsClientProps {
    initialRegistrations: Registration[]
    initialMessages: ContactMessage[]
}

export default function RequestsClient({ initialRegistrations, initialMessages }: RequestsClientProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'registrations' | 'messages'>('registrations')
    const [regFilter, setRegFilter] = useState('all')
    const [msgFilter, setMsgFilter] = useState('all')
    const [loading, setLoading] = useState<string | null>(null)
    const [selectedItem, setSelectedItem] = useState<Registration | ContactMessage | null>(null)

    const regStatuses = ['PENDING', 'APPROVED', 'REJECTED']
    const msgStatuses = ['NEW', 'READ', 'REPLIED', 'CLOSED']

    const filteredRegs = regFilter === 'all'
        ? initialRegistrations
        : initialRegistrations.filter(r => r.status === regFilter)

    const filteredMsgs = msgFilter === 'all'
        ? initialMessages
        : initialMessages.filter(m => m.status === msgFilter)

    const handleRegAction = async (regId: string, status: 'APPROVED' | 'REJECTED') => {
        setLoading(regId)
        const result = await updateRegistrationStatus(regId, status)
        if (result.error) {
            alert(result.error)
        }
        setLoading(null)
        setSelectedItem(null)
        router.refresh()
    }

    const handleMsgAction = async (msgId: string, status: 'READ' | 'REPLIED' | 'CLOSED') => {
        setLoading(msgId)
        const result = await updateContactStatus(msgId, status)
        if (result.error) {
            alert(result.error)
        }
        setLoading(null)
        setSelectedItem(null)
        router.refresh()
    }

    const getRegStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return { bg: '#fef3c7', color: '#b45309' }
            case 'APPROVED': return { bg: '#dcfce7', color: '#16a34a' }
            case 'REJECTED': return { bg: '#fee2e2', color: '#dc2626' }
            default: return { bg: '#f1f5f9', color: '#64748b' }
        }
    }

    const getMsgStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return { bg: '#dbeafe', color: '#1d4ed8' }
            case 'READ': return { bg: '#fef3c7', color: '#b45309' }
            case 'REPLIED': return { bg: '#dcfce7', color: '#16a34a' }
            case 'CLOSED': return { bg: '#f1f5f9', color: '#64748b' }
            default: return { bg: '#f1f5f9', color: '#64748b' }
        }
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>Requests & Messages</h2>
                <p>Manage Club Registrations & Contact Messages</p>
            </div>

            <div className={styles.adminNav}>
                <Link href="/admin" className={styles.navLink}>
                    <i className="fa fa-chart-simple"></i> Overview
                </Link>
                <Link href="/admin/bookings" className={styles.navLink}>
                    <i className="fa fa-calendar-check"></i> Bookings
                </Link>
                <Link href="/admin/requests" className={`${styles.navLink} ${styles.active}`}>
                    <i className="fa fa-inbox"></i> Requests
                </Link>
                <Link href="/admin/analytics" className={styles.navLink}>
                    <i className="fa fa-chart-pie"></i> Analytics
                </Link>
                <Link href="/admin/audit" className={styles.navLink}>
                    <i className="fa fa-clipboard-list"></i> Audit Log
                </Link>
            </div>

            {/* Tabs */}
            <div className={styles.filterBar}>
                <button
                    className={`${styles.filterBtn} ${activeTab === 'registrations' ? styles.active : ''}`}
                    onClick={() => setActiveTab('registrations')}
                >
                    <i className="fa fa-user-plus"></i> Registrations ({initialRegistrations.length})
                </button>
                <button
                    className={`${styles.filterBtn} ${activeTab === 'messages' ? styles.active : ''}`}
                    onClick={() => setActiveTab('messages')}
                >
                    <i className="fa fa-envelope"></i> Messages ({initialMessages.length})
                </button>
            </div>

            {/* Registrations Tab */}
            {activeTab === 'registrations' && (
                <>
                    <div className={styles.filterBar} style={{ marginTop: '1rem' }}>
                        <button
                            className={`${styles.filterBtn} ${regFilter === 'all' ? styles.active : ''}`}
                            onClick={() => setRegFilter('all')}
                        >
                            All ({initialRegistrations.length})
                        </button>
                        {regStatuses.map(status => {
                            const count = initialRegistrations.filter(r => r.status === status).length
                            return (
                                <button
                                    key={status}
                                    className={`${styles.filterBtn} ${regFilter === status ? styles.active : ''}`}
                                    onClick={() => setRegFilter(status)}
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
                                        <th>Name</th>
                                        <th>Military ID</th>
                                        <th>Department</th>
                                        <th>Year</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRegs.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                                No registrations found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRegs.map(reg => (
                                            <tr key={reg.id}>
                                                <td>
                                                    <strong>{reg.fullName}</strong><br />
                                                    <small style={{ color: '#64748b' }}>{reg.email}</small>
                                                </td>
                                                <td>{reg.militaryId}</td>
                                                <td>{reg.department}</td>
                                                <td>{reg.yearLevel || '-'}</td>
                                                <td>{new Date(reg.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 600,
                                                        background: getRegStatusColor(reg.status).bg,
                                                        color: getRegStatusColor(reg.status).color
                                                    }}>
                                                        {reg.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.actionBtns}>
                                                        <button
                                                            className={styles.viewBtn}
                                                            onClick={() => setSelectedItem(reg)}
                                                            title="View Details"
                                                        >
                                                            <i className="fa fa-eye"></i>
                                                        </button>
                                                        {reg.status === 'PENDING' && (
                                                            <>
                                                                <button
                                                                    className={styles.approveBtn}
                                                                    onClick={() => handleRegAction(reg.id, 'APPROVED')}
                                                                    disabled={loading === reg.id}
                                                                    title="Approve"
                                                                >
                                                                    <i className="fa fa-check"></i>
                                                                </button>
                                                                <button
                                                                    className={styles.rejectBtn}
                                                                    onClick={() => handleRegAction(reg.id, 'REJECTED')}
                                                                    disabled={loading === reg.id}
                                                                    title="Reject"
                                                                >
                                                                    <i className="fa fa-times"></i>
                                                                </button>
                                                            </>
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
                </>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
                <>
                    <div className={styles.filterBar} style={{ marginTop: '1rem' }}>
                        <button
                            className={`${styles.filterBtn} ${msgFilter === 'all' ? styles.active : ''}`}
                            onClick={() => setMsgFilter('all')}
                        >
                            All ({initialMessages.length})
                        </button>
                        {msgStatuses.map(status => {
                            const count = initialMessages.filter(m => m.status === status).length
                            return (
                                <button
                                    key={status}
                                    className={`${styles.filterBtn} ${msgFilter === status ? styles.active : ''}`}
                                    onClick={() => setMsgFilter(status)}
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
                                        <th>From</th>
                                        <th>Subject</th>
                                        <th>Message</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMsgs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                                No messages found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMsgs.map(msg => (
                                            <tr key={msg.id}>
                                                <td>
                                                    <strong>{msg.name}</strong><br />
                                                    <small style={{ color: '#64748b' }}>{msg.email}</small>
                                                </td>
                                                <td><strong>{msg.subject}</strong></td>
                                                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {msg.message}
                                                </td>
                                                <td>{new Date(msg.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 600,
                                                        background: getMsgStatusColor(msg.status).bg,
                                                        color: getMsgStatusColor(msg.status).color
                                                    }}>
                                                        {msg.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.actionBtns}>
                                                        <button
                                                            className={styles.viewBtn}
                                                            onClick={() => setSelectedItem(msg)}
                                                            title="View Details"
                                                        >
                                                            <i className="fa fa-eye"></i>
                                                        </button>
                                                        {msg.status === 'NEW' && (
                                                            <button
                                                                className={styles.approveBtn}
                                                                onClick={() => handleMsgAction(msg.id, 'READ')}
                                                                disabled={loading === msg.id}
                                                                title="Mark as Read"
                                                            >
                                                                <i className="fa fa-check"></i>
                                                            </button>
                                                        )}
                                                        {(msg.status === 'NEW' || msg.status === 'READ') && (
                                                            <button
                                                                className={styles.completeBtn}
                                                                onClick={() => handleMsgAction(msg.id, 'REPLIED')}
                                                                disabled={loading === msg.id}
                                                                title="Mark as Replied"
                                                            >
                                                                <i className="fa fa-reply"></i>
                                                            </button>
                                                        )}
                                                        {msg.status !== 'CLOSED' && (
                                                            <button
                                                                className={styles.cancelBtn}
                                                                onClick={() => handleMsgAction(msg.id, 'CLOSED')}
                                                                disabled={loading === msg.id}
                                                                title="Close"
                                                            >
                                                                <i className="fa fa-archive"></i>
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
                </>
            )}

            {/* Detail Modal */}
            {selectedItem && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000, padding: '2rem'
                    }}
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        style={{
                            background: 'white', borderRadius: '20px', maxWidth: '600px', width: '100%',
                            maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'linear-gradient(135deg, #fffbef, white)', borderRadius: '20px 20px 0 0'
                        }}>
                            <h3 style={{ margin: 0, color: '#1e293b' }}>
                                {'fullName' in selectedItem ? 'Registration Details' : 'Message Details'}
                            </h3>
                            <button
                                onClick={() => setSelectedItem(null)}
                                style={{
                                    width: '40px', height: '40px', borderRadius: '50%', border: 'none',
                                    background: '#f1f5f9', cursor: 'pointer', color: '#64748b'
                                }}
                            >
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            {'fullName' in selectedItem ? (
                                // Registration details
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Name</label>
                                            <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: '#1e293b' }}>{selectedItem.fullName}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Military ID</label>
                                            <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: '#1e293b' }}>{selectedItem.militaryId}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Email</label>
                                            <p style={{ margin: '0.25rem 0 0', color: '#1e293b' }}>{selectedItem.email}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Phone</label>
                                            <p style={{ margin: '0.25rem 0 0', color: '#1e293b' }}>{selectedItem.phone || '-'}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Department</label>
                                            <p style={{ margin: '0.25rem 0 0', color: '#1e293b' }}>{selectedItem.department}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Year</label>
                                            <p style={{ margin: '0.25rem 0 0', color: '#1e293b' }}>{selectedItem.yearLevel || '-'}</p>
                                        </div>
                                    </div>
                                    {selectedItem.interests && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Interests</label>
                                            <p style={{ margin: '0.25rem 0 0', color: '#1e293b' }}>{selectedItem.interests}</p>
                                        </div>
                                    )}
                                    {selectedItem.motivation && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Motivation</label>
                                            <p style={{ margin: '0.25rem 0 0', color: '#475569', lineHeight: 1.6 }}>{selectedItem.motivation}</p>
                                        </div>
                                    )}
                                    {selectedItem.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                                            <button
                                                onClick={() => handleRegAction(selectedItem.id, 'APPROVED')}
                                                disabled={loading === selectedItem.id}
                                                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                <i className="fa fa-check"></i> Approve
                                            </button>
                                            <button
                                                onClick={() => handleRegAction(selectedItem.id, 'REJECTED')}
                                                disabled={loading === selectedItem.id}
                                                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                <i className="fa fa-times"></i> Reject
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                // Message details
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>From</label>
                                            <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: '#1e293b' }}>{selectedItem.name}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Email</label>
                                            <p style={{ margin: '0.25rem 0 0', color: '#1e293b' }}>{selectedItem.email}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Phone</label>
                                            <p style={{ margin: '0.25rem 0 0', color: '#1e293b' }}>{selectedItem.phone || '-'}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Subject</label>
                                            <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: '#1e293b' }}>{selectedItem.subject}</p>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Message</label>
                                        <p style={{ margin: '0.25rem 0 0', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selectedItem.message}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                                        {selectedItem.status === 'NEW' && (
                                            <button
                                                onClick={() => handleMsgAction(selectedItem.id, 'READ')}
                                                disabled={loading === selectedItem.id}
                                                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#f59e0b', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                <i className="fa fa-check"></i> Mark Read
                                            </button>
                                        )}
                                        {selectedItem.status !== 'REPLIED' && selectedItem.status !== 'CLOSED' && (
                                            <button
                                                onClick={() => handleMsgAction(selectedItem.id, 'REPLIED')}
                                                disabled={loading === selectedItem.id}
                                                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                <i className="fa fa-reply"></i> Mark Replied
                                            </button>
                                        )}
                                        {selectedItem.status !== 'CLOSED' && (
                                            <button
                                                onClick={() => handleMsgAction(selectedItem.id, 'CLOSED')}
                                                disabled={loading === selectedItem.id}
                                                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#64748b', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                <i className="fa fa-archive"></i> Close
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
