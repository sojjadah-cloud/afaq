import { getAuditLogs } from '@/actions/notifications'
import styles from '../admin.module.css'
import Link from 'next/link'

export default async function AuditLogPage() {
    const logs = await getAuditLogs(100)

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getActionColor = (action: string) => {
        if (action.includes('CREATE') || action.includes('ADD')) return '#10b981'
        if (action.includes('DELETE') || action.includes('REMOVE')) return '#ef4444'
        if (action.includes('UPDATE') || action.includes('EDIT')) return '#3b82f6'
        if (action.includes('LOGIN')) return '#8b5cf6'
        return '#64748b'
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>Audit Log</h2>
                <p>System Activity & Change History</p>
            </div>

            <div className={styles.adminNav}>
                <Link href="/admin" className={styles.navLink}>
                    <i className="fa fa-chart-simple"></i> Overview
                </Link>
                <Link href="/admin/bookings" className={styles.navLink}>
                    <i className="fa fa-calendar-check"></i> Bookings
                </Link>
                <Link href="/admin/analytics" className={styles.navLink}>
                    <i className="fa fa-chart-pie"></i> Analytics
                </Link>
                <Link href="/admin/audit" className={`${styles.navLink} ${styles.active}`}>
                    <i className="fa fa-clipboard-list"></i> Audit Log
                </Link>
            </div>

            <div className={styles.section}>
                <h3>Recent Activity</h3>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Table</th>
                                <th>Record ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                        <i className="fa fa-clipboard-list" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}></i>
                                        No audit logs recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log: any) => (
                                    <tr key={log.id}>
                                        <td>{formatDate(log.createdAt)}</td>
                                        <td>
                                            {log.userName || 'System'}
                                            {log.militaryId && (
                                                <br />
                                            )}
                                            <small style={{ color: '#94a3b8' }}>{log.militaryId}</small>
                                        </td>
                                        <td>
                                            <span style={{
                                                background: `${getActionColor(log.action)}15`,
                                                color: getActionColor(log.action),
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748b' }}>{log.tableName || '-'}</td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                            {log.recordId ? log.recordId.substring(0, 20) + '...' : '-'}
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
