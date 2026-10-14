import { getAuditLogs } from '@/actions/notifications'
import styles from '../admin.module.css'
import Link from 'next/link'
import AdminNav from '@/components/AdminNav'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { pageTitle } from '@/lib/metadata'
import { getT } from '@/i18n/server'
import { localeOf } from '@/i18n/core'

export const generateMetadata = () => pageTitle('Audit Log')

export const dynamic = 'force-dynamic'

export default async function AuditLogPage() {
    const session = await getSession()
    if (session.role !== 'ADMIN') redirect('/staff')
    const { t, lang } = await getT()

    const logs = await getAuditLogs(100)

    const formatDate = (date: string) => {
        return new Date(String(date).replace(' ', 'T')).toLocaleString(localeOf(lang), {
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
                <h2>{t('Audit Log')}</h2>
                <p>{t('System activity and change history')}</p>
            </div>

            <AdminNav />

            <div className={styles.section}>
                <h3>{t('Recent activity')}</h3>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>{t('Time')}</th>
                                <th>{t('User')}</th>
                                <th>{t('Action')}</th>
                                <th>{t('Table')}</th>
                                <th>{t('Record ID')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                        <i className="fa fa-clipboard-list" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }} aria-hidden="true"></i>
                                        {t('No audit logs recorded yet.')}
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log: any) => (
                                    <tr key={log.id}>
                                        <td>{formatDate(log.createdAt)}</td>
                                        <td>
                                            {log.userName || t('System')}
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
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} dir="ltr">
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
