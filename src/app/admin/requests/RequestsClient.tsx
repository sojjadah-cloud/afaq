'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../admin.module.css'
import { updateRegistrationStatus } from '@/actions/club'
import { updateContactStatus } from '@/actions/contact'
import AdminNav from '@/components/AdminNav'
import ExportButton from '@/components/ExportButton'
import { useT, useFormatDay } from '@/i18n/client'

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected',
    NEW: 'New', READ: 'Read', REPLIED: 'Replied', CLOSED: 'Closed',
}

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
    const t = useT()
    const formatDay = useFormatDay()
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
            alert(t(result.error))
        }
        setLoading(null)
        setSelectedItem(null)
        router.refresh()
    }

    const handleMsgAction = async (msgId: string, status: 'READ' | 'REPLIED' | 'CLOSED') => {
        setLoading(msgId)
        const result = await updateContactStatus(msgId, status)
        if (result.error) {
            alert(t(result.error))
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
                <h2>{t('Requests & Messages')}</h2>
                <p>{t('Club registrations and contact messages')}</p>
            </div>

            <AdminNav />

            <div className={styles.exportRow}>
                <ExportButton kind="registrations" label="Export registrations" />
                <ExportButton kind="messages" label="Export messages" />
            </div>

            {/* Tabs */}
            <div className={styles.filterBar}>
                <button
                    className={`${styles.filterBtn} ${activeTab === 'registrations' ? styles.active : ''}`}
                    onClick={() => setActiveTab('registrations')}
                >
                    <i className="fa fa-user-plus" aria-hidden="true"></i> {t('Club registrations')} ({initialRegistrations.length})
                </button>
                <button
                    className={`${styles.filterBtn} ${activeTab === 'messages' ? styles.active : ''}`}
                    onClick={() => setActiveTab('messages')}
                >
                    <i className="fa fa-envelope" aria-hidden="true"></i> {t('Messages')} ({initialMessages.length})
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
                            {t('All')} ({initialRegistrations.length})
                        </button>
                        {regStatuses.map(status => {
                            const count = initialRegistrations.filter(r => r.status === status).length
                            return (
                                <button
                                    key={status}
                                    className={`${styles.filterBtn} ${regFilter === status ? styles.active : ''}`}
                                    onClick={() => setRegFilter(status)}
                                >
                                    {t(STATUS_LABELS[status] || status)} ({count})
                                </button>
                            )
                        })}
                    </div>

                    <div className={styles.section}>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>{t('Name')}</th>
                                        <th>{t('Military ID')}</th>
                                        <th>{t('Department')}</th>
                                        <th>{t('Year')}</th>
                                        <th>{t('Date')}</th>
                                        <th>{t('Status')}</th>
                                        <th>{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRegs.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                                {t('No registrations found.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRegs.map(reg => (
                                            <tr key={reg.id}>
                                                <td>
                                                    <strong>{reg.fullName}</strong><br />
                                                    <small style={{ color: '#64748b' }}>{reg.email}</small>
                                                </td>
                                                <td dir="ltr">{reg.militaryId}</td>
                                                <td>{t(reg.department)}</td>
                                                <td>{reg.yearLevel ? t(reg.yearLevel) : '-'}</td>
                                                <td>{formatDay(reg.createdAt)}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 600,
                                                        background: getRegStatusColor(reg.status).bg,
                                                        color: getRegStatusColor(reg.status).color
                                                    }}>
                                                        {t(STATUS_LABELS[reg.status] || reg.status)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.actionBtns}>
                                                        <button
                                                            className={styles.viewBtn}
                                                            onClick={() => setSelectedItem(reg)}
                                                            title={t('View details')}
                                                            aria-label={t('View details for {name}', { name: reg.fullName })}
                                                        >
                                                            <i className="fa fa-eye" aria-hidden="true"></i>
                                                        </button>
                                                        {reg.status === 'PENDING' && (
                                                            <>
                                                                <button
                                                                    className={styles.approveBtn}
                                                                    onClick={() => handleRegAction(reg.id, 'APPROVED')}
                                                                    disabled={loading === reg.id}
                                                                    title={t('Approve')}
                                                                    aria-label={t('Approve {name}', { name: reg.fullName })}
                                                                >
                                                                    <i className="fa fa-check" aria-hidden="true"></i>
                                                                </button>
                                                                <button
                                                                    className={styles.rejectBtn}
                                                                    onClick={() => handleRegAction(reg.id, 'REJECTED')}
                                                                    disabled={loading === reg.id}
                                                                    title={t('Reject')}
                                                                    aria-label={t('Reject {name}', { name: reg.fullName })}
                                                                >
                                                                    <i className="fa fa-times" aria-hidden="true"></i>
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
                            {t('All')} ({initialMessages.length})
                        </button>
                        {msgStatuses.map(status => {
                            const count = initialMessages.filter(m => m.status === status).length
                            return (
                                <button
                                    key={status}
                                    className={`${styles.filterBtn} ${msgFilter === status ? styles.active : ''}`}
                                    onClick={() => setMsgFilter(status)}
                                >
                                    {t(STATUS_LABELS[status] || status)} ({count})
                                </button>
                            )
                        })}
                    </div>

                    <div className={styles.section}>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>{t('From')}</th>
                                        <th>{t('Subject')}</th>
                                        <th>{t('Message')}</th>
                                        <th>{t('Date')}</th>
                                        <th>{t('Status')}</th>
                                        <th>{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMsgs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                                {t('No messages found.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMsgs.map(msg => (
                                            <tr key={msg.id}>
                                                <td>
                                                    <strong>{msg.name}</strong><br />
                                                    <small style={{ color: '#64748b' }}>{msg.email}</small>
                                                </td>
                                                <td><strong>{t(msg.subject)}</strong></td>
                                                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {msg.message}
                                                </td>
                                                <td>{formatDay(msg.createdAt)}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 600,
                                                        background: getMsgStatusColor(msg.status).bg,
                                                        color: getMsgStatusColor(msg.status).color
                                                    }}>
                                                        {t(STATUS_LABELS[msg.status] || msg.status)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.actionBtns}>
                                                        <button
                                                            className={styles.viewBtn}
                                                            onClick={() => setSelectedItem(msg)}
                                                            title={t('View details')}
                                                            aria-label={t('View details for {name}', { name: msg.name })}
                                                        >
                                                            <i className="fa fa-eye" aria-hidden="true"></i>
                                                        </button>
                                                        {msg.status === 'NEW' && (
                                                            <button
                                                                className={styles.approveBtn}
                                                                onClick={() => handleMsgAction(msg.id, 'READ')}
                                                                disabled={loading === msg.id}
                                                                title={t('Mark as read')}
                                                                aria-label={t('Mark as read')}
                                                            >
                                                                <i className="fa fa-check" aria-hidden="true"></i>
                                                            </button>
                                                        )}
                                                        {(msg.status === 'NEW' || msg.status === 'READ') && (
                                                            <button
                                                                className={styles.completeBtn}
                                                                onClick={() => handleMsgAction(msg.id, 'REPLIED')}
                                                                disabled={loading === msg.id}
                                                                title={t('Mark as replied')}
                                                                aria-label={t('Mark as replied')}
                                                            >
                                                                <i className="fa fa-reply" aria-hidden="true"></i>
                                                            </button>
                                                        )}
                                                        {msg.status !== 'CLOSED' && (
                                                            <button
                                                                className={styles.cancelBtn}
                                                                onClick={() => handleMsgAction(msg.id, 'CLOSED')}
                                                                disabled={loading === msg.id}
                                                                title={t('Close message')}
                                                                aria-label={t('Close message')}
                                                            >
                                                                <i className="fa fa-archive" aria-hidden="true"></i>
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
                        zIndex: 1000, padding: '1rem'
                    }}
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        style={{
                            background: 'white', borderRadius: '20px', maxWidth: '600px', width: '100%',
                            maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
                        }}
                        onClick={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="request-detail-title"
                    >
                        <div style={{
                            padding: '1.25rem clamp(1rem, 4vw, 2rem)', borderBottom: '1px solid #e2e8f0',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'linear-gradient(135deg, #fffbef, white)', borderRadius: '20px 20px 0 0'
                        }}>
                            <h3 id="request-detail-title" style={{ margin: 0, color: '#1e293b' }}>
                                {'fullName' in selectedItem ? t('Registration details') : t('Message details')}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                aria-label={t('Close')}
                                style={{
                                    width: '40px', height: '40px', borderRadius: '50%', border: 'none',
                                    background: '#f1f5f9', cursor: 'pointer', color: '#64748b'
                                }}
                            >
                                <i className="fa fa-times" aria-hidden="true"></i>
                            </button>
                        </div>
                        <div style={{ padding: 'clamp(1rem, 4vw, 2rem)' }}>
                            {'fullName' in selectedItem ? (
                                // Registration details
                                <>
                                    <div className={styles.formGrid2}>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Name')}</label>
                                            <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: '#1e293b' }}>{selectedItem.fullName}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Military ID')}</label>
                                            <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: '#1e293b' }}><span dir="ltr">{selectedItem.militaryId}</span></p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Email')}</label>
                                            <p style={{ margin: '0.25rem 0 0', color: '#1e293b' }}>{selectedItem.email}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Phone')}</label>
                                            <p style={{ margin: '0.25rem 0 0', color: '#1e293b' }}>{selectedItem.phone || '-'}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Department')}</label>
                                            <p style={{ margin: '0.25rem 0 0', color: '#1e293b' }}>{t(selectedItem.department)}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Year')}</label>
                                            <p style={{ margin: '0.25rem 0 0', color: '#1e293b' }}>{selectedItem.yearLevel ? t(selectedItem.yearLevel) : '-'}</p>
                                        </div>
                                    </div>
                                    {selectedItem.interests && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Interests')}</label>
                                            <p style={{ margin: '0.25rem 0 0', color: '#1e293b' }}>{selectedItem.interests}</p>
                                        </div>
                                    )}
                                    {selectedItem.motivation && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Motivation')}</label>
                                            <p style={{ margin: '0.25rem 0 0', color: '#475569', lineHeight: 1.6 }}>{selectedItem.motivation}</p>
                                        </div>
                                    )}
                                    {selectedItem.status === 'PENDING' && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                                            <button
                                                onClick={() => handleRegAction(selectedItem.id, 'APPROVED')}
                                                disabled={loading === selectedItem.id}
                                                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                <i className="fa fa-check" aria-hidden="true"></i> {t('Approve')}
                                            </button>
                                            <button
                                                onClick={() => handleRegAction(selectedItem.id, 'REJECTED')}
                                                disabled={loading === selectedItem.id}
                                                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                <i className="fa fa-times" aria-hidden="true"></i> {t('Reject')}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                // Message details
                                <>
                                    <div className={styles.formGrid2}>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>{t('From')}</label>
                                            <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: '#1e293b' }}>{selectedItem.name}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Email')}</label>
                                            <p style={{ margin: '0.25rem 0 0', color: '#1e293b' }}>{selectedItem.email}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Phone')}</label>
                                            <p style={{ margin: '0.25rem 0 0', color: '#1e293b' }}>{selectedItem.phone || '-'}</p>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Subject')}</label>
                                            <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: '#1e293b' }}>{t(selectedItem.subject)}</p>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Message')}</label>
                                        <p style={{ margin: '0.25rem 0 0', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selectedItem.message}</p>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                                        {selectedItem.status === 'NEW' && (
                                            <button
                                                onClick={() => handleMsgAction(selectedItem.id, 'READ')}
                                                disabled={loading === selectedItem.id}
                                                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#f59e0b', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                <i className="fa fa-check" aria-hidden="true"></i> {t('Mark as read')}
                                            </button>
                                        )}
                                        {selectedItem.status !== 'REPLIED' && selectedItem.status !== 'CLOSED' && (
                                            <button
                                                onClick={() => handleMsgAction(selectedItem.id, 'REPLIED')}
                                                disabled={loading === selectedItem.id}
                                                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                <i className="fa fa-reply" aria-hidden="true"></i> {t('Mark as replied')}
                                            </button>
                                        )}
                                        {selectedItem.status !== 'CLOSED' && (
                                            <button
                                                onClick={() => handleMsgAction(selectedItem.id, 'CLOSED')}
                                                disabled={loading === selectedItem.id}
                                                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#64748b', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                <i className="fa fa-archive" aria-hidden="true"></i> {t('Close message')}
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
