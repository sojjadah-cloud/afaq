'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../admin.module.css'
import ExportButton from '@/components/ExportButton'
import { createUserAccount, resetUserPassword, setUserActive, updateUserRole } from '@/actions/admin'
import { useT } from '@/i18n/client'

export interface AdminUserRow {
    id: string
    militaryId: string
    email: string
    role: string
    isActive: boolean
    createdAt: string
    fullName: string
    department: string
}

const ROLE_LABELS: Record<string, string> = { STUDENT: 'Student', STAFF: 'Staff', ADMIN: 'Administrator' }

export default function UsersClient({ users, currentUserId, departments, programmes }: {
    users: AdminUserRow[]
    currentUserId: string
    departments: { id: string; name: string }[]
    programmes: { id: string; name: string; departmentId: string }[]
}) {
    const router = useRouter()
    const t = useT()
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('ALL')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [busy, setBusy] = useState<string | null>(null)
    const [showCreate, setShowCreate] = useState(false)
    const [createError, setCreateError] = useState('')
    const [credential, setCredential] = useState<{ title: string; militaryId: string; password: string } | null>(null)
    const [copied, setCopied] = useState(false)
    const [newDept, setNewDept] = useState('')
    const [newRole, setNewRole] = useState('STAFF')

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase()
        return users.filter(u =>
            (roleFilter === 'ALL' || u.role === roleFilter) &&
            (statusFilter === 'ALL' || (statusFilter === 'ACTIVE') === u.isActive) &&
            (!q || [u.fullName, u.militaryId, u.email, u.department].some(v => v.toLowerCase().includes(q)))
        )
    }, [users, search, roleFilter, statusFilter])

    const counts = {
        ALL: users.length,
        STUDENT: users.filter(u => u.role === 'STUDENT').length,
        STAFF: users.filter(u => u.role === 'STAFF').length,
        ADMIN: users.filter(u => u.role === 'ADMIN').length,
    }

    const run = async (key: string, action: () => Promise<{ error?: string }>) => {
        setBusy(key)
        try {
            const result = await action()
            if (result.error) alert(t(result.error))
            else router.refresh()
        } catch {
            alert(t('Something went wrong. Please try again.'))
        } finally {
            setBusy(null)
        }
    }

    const changeRole = (u: AdminUserRow, role: string) => {
        if (role === u.role) return
        if (!confirm(t('Change {name} to {role}? They will be signed out.', { name: u.fullName || u.militaryId, role: t(ROLE_LABELS[role]) }))) {
            router.refresh()
            return
        }
        run(u.id, () => updateUserRole(u.id, role))
    }

    const toggleActive = (u: AdminUserRow) => {
        const name = u.fullName || u.militaryId
        if (!confirm(u.isActive ? t('Deactivate {name}?', { name }) : t('Activate {name}?', { name }))) return
        run(u.id, () => setUserActive(u.id, !u.isActive))
    }

    const resetPassword = async (u: AdminUserRow) => {
        if (!confirm(t('Reset the password for {name}? Their current password will stop working.', { name: u.fullName || u.militaryId }))) return
        setBusy(u.id)
        const result = await resetUserPassword(u.id).catch(() => ({ error: 'Something went wrong. Please try again.' } as { error: string; password?: string; militaryId?: string }))
        setBusy(null)
        if (result.error) alert(t(result.error))
        else if (result.password) {
            setCopied(false)
            setCredential({ title: t('New password for {name}', { name: u.fullName || u.militaryId }), militaryId: result.militaryId, password: result.password })
        }
    }

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setCreateError('')
        setBusy('create')
        const result = await createUserAccount(new FormData(e.currentTarget)).catch(() => ({ error: 'Something went wrong. Please try again.' } as { error: string; password?: string; militaryId?: string }))
        setBusy(null)
        if (result.error) {
            setCreateError(t(result.error))
            return
        }
        setShowCreate(false)
        setCopied(false)
        setCredential({ title: t('Account created'), militaryId: result.militaryId!, password: result.password! })
        router.refresh()
    }

    const copyCredential = async () => {
        if (!credential) return
        await navigator.clipboard.writeText(`Military ID: ${credential.militaryId}\nTemporary password: ${credential.password}`)
        setCopied(true)
    }

    return (
        <>
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                    <input
                        type="search"
                        placeholder={t('Search by name, military ID, email or department')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        aria-label={t('Search users')}
                    />
                </div>
                <div className={styles.toolbarActions}>
                    <ExportButton kind="users" label="Export users" />
                    <button type="button" className={styles.primaryBtn} onClick={() => { setCreateError(''); setNewDept(''); setNewRole('STAFF'); setShowCreate(true) }}>
                        <i className="fa-solid fa-user-plus" aria-hidden="true"></i> {t('Add User')}
                    </button>
                </div>
            </div>

            <div className={styles.filterBar}>
                {(['ALL', 'STUDENT', 'STAFF', 'ADMIN'] as const).map(r => (
                    <button key={r} type="button" className={`${styles.filterBtn} ${roleFilter === r ? styles.active : ''}`} onClick={() => setRoleFilter(r)}>
                        {r === 'ALL' ? t('All') : t(ROLE_LABELS[r])} ({counts[r]})
                    </button>
                ))}
                <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label={t('Filter by status')}>
                    <option value="ALL">{t('Any status')}</option>
                    <option value="ACTIVE">{t('Active')}</option>
                    <option value="INACTIVE">{t('Deactivated')}</option>
                </select>
            </div>

            <div className={styles.section}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>{t('User')}</th>
                                <th>{t('Military ID')}</th>
                                <th>{t('Department')}</th>
                                <th>{t('Role')}</th>
                                <th>{t('Status')}</th>
                                <th>{t('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>{t('No users match your filters.')}</td></tr>
                            ) : visible.map(u => {
                                const self = u.id === currentUserId
                                return (
                                    <tr key={u.id} style={{ opacity: u.isActive ? 1 : 0.6 }}>
                                        <td>
                                            <strong>{u.fullName || '—'}</strong>{self && <span className={styles.youTag}>{t('You')}</span>}
                                            <br />
                                            <small style={{ color: '#64748b' }}>{u.email}</small>
                                        </td>
                                        <td style={{ fontFamily: 'monospace' }} dir="ltr">{u.militaryId}</td>
                                        <td>{u.department ? t(u.department) : '—'}</td>
                                        <td>
                                            <select
                                                className={styles.inlineSelect}
                                                value={u.role}
                                                disabled={self || busy === u.id}
                                                onChange={e => changeRole(u, e.target.value)}
                                                aria-label={t('Role for {name}', { name: u.fullName || u.militaryId })}
                                            >
                                                <option value="STUDENT">{t('Student')}</option>
                                                <option value="STAFF">{t('Staff')}</option>
                                                <option value="ADMIN">{t('Administrator')}</option>
                                            </select>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${u.isActive ? styles.approved : styles.rejected}`}>
                                                {u.isActive ? t('Active') : t('Deactivated')}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actionBtns}>
                                                <button type="button" className={styles.cancelBtn} disabled={busy === u.id} onClick={() => resetPassword(u)}>
                                                    <i className="fa-solid fa-key" aria-hidden="true"></i> {t('Reset password')}
                                                </button>
                                                {!self && (
                                                    <button
                                                        type="button"
                                                        className={u.isActive ? styles.rejectBtn : styles.approveBtn}
                                                        disabled={busy === u.id}
                                                        onClick={() => toggleActive(u)}
                                                    >
                                                        <i className={`fa-solid ${u.isActive ? 'fa-user-slash' : 'fa-user-check'}`} aria-hidden="true"></i> {u.isActive ? t('Deactivate') : t('Activate')}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {showCreate && (
                <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
                    <div className={styles.modalBox} role="dialog" aria-modal="true" aria-labelledby="create-user-title" onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHead}>
                            <h3 id="create-user-title">{t('Add User')}</h3>
                            <button type="button" className={styles.modalClose} onClick={() => setShowCreate(false)} aria-label={t('Close')}><i className="fa fa-times" aria-hidden="true"></i></button>
                        </div>
                        <form onSubmit={handleCreate} className={styles.modalBody}>
                            <label className={styles.field}><span>{t('Full Name')} *</span><input name="fullName" required /></label>
                            <div className={styles.formGrid2}>
                                <label className={styles.field}><span>{t('Military ID')} *</span><input name="militaryId" required dir="ltr" /></label>
                                <label className={styles.field}>
                                    <span>{t('Role')} *</span>
                                    <select name="role" value={newRole} onChange={e => setNewRole(e.target.value)} required>
                                        <option value="STUDENT">{t('Student')}</option>
                                        <option value="STAFF">{t('Staff')}</option>
                                        <option value="ADMIN">{t('Administrator')}</option>
                                    </select>
                                </label>
                            </div>
                            <label className={styles.field}><span>{t('Email')} *</span><input name="email" type="email" required /></label>
                            <div className={styles.formGrid2}>
                                <label className={styles.field}>
                                    <span>{t('Department')} *</span>
                                    <select name="departmentId" value={newDept} onChange={e => setNewDept(e.target.value)} required>
                                        <option value="">{t('Select...')}</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{t(d.name)}</option>)}
                                    </select>
                                </label>
                                <label className={styles.field}>
                                    <span>{t('Programme')}{newRole === 'STUDENT' ? ' *' : ''}</span>
                                    <select name="programmeId" defaultValue="" required={newRole === 'STUDENT'} disabled={!newDept} key={newDept}>
                                        <option value="">{newRole === 'STUDENT' ? t('Select...') : t('None')}</option>
                                        {programmes.filter(p => p.departmentId === newDept).map(p => <option key={p.id} value={p.id}>{t(p.name)}</option>)}
                                    </select>
                                </label>
                            </div>
                            <p className={styles.hint}>{t('A temporary password is generated and shown once. Share it with the user and ask them to change it after signing in.')}</p>
                            {createError && <div className={styles.formError} role="alert">{createError}</div>}
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => setShowCreate(false)}>{t('Cancel')}</button>
                                <button type="submit" className={styles.primaryBtn} disabled={busy === 'create'}>
                                    {busy === 'create' ? t('Creating...') : t('Create Account')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {credential && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalBox} role="dialog" aria-modal="true" aria-labelledby="credential-title">
                        <div className={styles.modalHead}>
                            <h3 id="credential-title">{credential.title}</h3>
                        </div>
                        <div className={styles.modalBody}>
                            <p className={styles.hint}>{t('This password is shown only once. Copy it now and share it privately.')}</p>
                            <div className={styles.credentialBox}>
                                <div><small>{t('Military ID')}</small><strong dir="ltr">{credential.militaryId}</strong></div>
                                <div><small>{t('Temporary password')}</small><strong dir="ltr">{credential.password}</strong></div>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.secondaryBtn} onClick={copyCredential}>
                                    <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} aria-hidden="true"></i> {copied ? t('Copied') : t('Copy')}
                                </button>
                                <button type="button" className={styles.primaryBtn} onClick={() => setCredential(null)}>{t('Done')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
