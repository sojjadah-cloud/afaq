import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from '../admin.module.css'
import { getClubRegistrations } from '@/actions/club'
import { getContactMessages } from '@/actions/contact'

export default async function AdminRequestsPage() {
    const session = await getSession()

    if (!session.isLoggedIn || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
        redirect('/login')
    }

    const registrations = await getClubRegistrations()
    const contactMessages = await getContactMessages()

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>Requests & Messages</h2>
                <p>Club Registrations & Contact Messages</p>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Club Registrations */}
                <div className={styles.section}>
                    <h3><i className="fa fa-user-plus" style={{ color: 'var(--gold)' }}></i> Club Registrations ({registrations.length})</h3>
                    {registrations.length === 0 ? (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                            No registration requests yet.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto' }}>
                            {registrations.map((reg: any) => (
                                <div key={reg.id} style={{
                                    padding: '1rem',
                                    background: reg.status === 'PENDING' ? '#fffbef' : '#f8fafc',
                                    borderRadius: '10px',
                                    borderLeft: `4px solid ${reg.status === 'PENDING' ? 'var(--gold)' : reg.status === 'APPROVED' ? '#10b981' : '#ef4444'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <strong style={{ color: '#1e293b' }}>{reg.fullName}</strong>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                {reg.department} • {reg.yearLevel || 'N/A'}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                                {reg.email}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: reg.status === 'PENDING' ? '#fef3c7' : reg.status === 'APPROVED' ? '#dcfce7' : '#fee2e2',
                                            color: reg.status === 'PENDING' ? '#b45309' : reg.status === 'APPROVED' ? '#16a34a' : '#dc2626'
                                        }}>
                                            {reg.status}
                                        </span>
                                    </div>
                                    {reg.interests && (
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                                            <strong>Interests:</strong> {reg.interests}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Contact Messages */}
                <div className={styles.section}>
                    <h3><i className="fa fa-envelope" style={{ color: 'var(--gold)' }}></i> Contact Messages ({contactMessages.length})</h3>
                    {contactMessages.length === 0 ? (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                            No contact messages yet.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto' }}>
                            {contactMessages.map((msg: any) => (
                                <div key={msg.id} style={{
                                    padding: '1rem',
                                    background: msg.status === 'NEW' ? '#eff6ff' : '#f8fafc',
                                    borderRadius: '10px',
                                    borderLeft: `4px solid ${msg.status === 'NEW' ? '#3b82f6' : msg.status === 'READ' ? '#f59e0b' : '#10b981'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <strong style={{ color: '#1e293b' }}>{msg.subject}</strong>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                From: {msg.name} ({msg.email})
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: msg.status === 'NEW' ? '#dbeafe' : msg.status === 'READ' ? '#fef3c7' : '#dcfce7',
                                            color: msg.status === 'NEW' ? '#1d4ed8' : msg.status === 'READ' ? '#b45309' : '#16a34a'
                                        }}>
                                            {msg.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                                        {msg.message.length > 100 ? msg.message.substring(0, 100) + '...' : msg.message}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                        {new Date(msg.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
