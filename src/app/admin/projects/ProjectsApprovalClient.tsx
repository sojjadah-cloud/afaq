'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminApproveProject, adminValidateCompletion, adminRejectProject } from '@/actions/projects'
import styles from '../admin.module.css'
import { useT } from '@/i18n/client'

interface Project {
    id: string
    title: string
    description: string
    status: 'PENDING_APPROVAL' | 'PENDING_COMPLETION'
    category: string
    creatorName: string
    militaryId: string
    updatedAt: string
}

export default function ProjectsApprovalClient({ projects }: { projects: Project[] }) {
    const [loading, setLoading] = useState<string | null>(null)
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [rejectReason, setRejectReason] = useState('')
    const [filter, setFilter] = useState<'all' | 'approval' | 'completion'>('all')
    const router = useRouter()
    const t = useT()

    const pendingApproval = projects.filter(p => p.status === 'PENDING_APPROVAL')
    const pendingCompletion = projects.filter(p => p.status === 'PENDING_COMPLETION')

    const filteredProjects = filter === 'all'
        ? projects
        : filter === 'approval'
            ? pendingApproval
            : pendingCompletion

    async function handleApprove(projectId: string) {
        if (!confirm(t('Approve this project to start development?'))) return
        setLoading(projectId)
        const result = await adminApproveProject(projectId)
        if (result.error) alert(t(result.error))
        setLoading(null)
        router.refresh()
    }

    async function handleValidate(projectId: string) {
        if (!confirm(t('Mark this project as completed?'))) return
        setLoading(projectId)
        const result = await adminValidateCompletion(projectId)
        if (result.error) alert(t(result.error))
        setLoading(null)
        router.refresh()
    }

    async function handleReject(projectId: string) {
        setLoading(projectId)
        const result = await adminRejectProject(projectId, rejectReason)
        if (result.error) alert(t(result.error))
        setRejectingId(null)
        setRejectReason('')
        setLoading(null)
        router.refresh()
    }

    return (
        <div className={styles.section}>
            {/* Filter Bar */}
            <div className={styles.filterBar}>
                <button
                    className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                    onClick={() => setFilter('all')}
                >
                    {t('All')} ({projects.length})
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'approval' ? styles.active : ''}`}
                    onClick={() => setFilter('approval')}
                >
                    <i className="fa fa-clock" style={{ marginInlineEnd: '0.5rem' }} aria-hidden="true"></i>
                    {t('Awaiting Approval')} ({pendingApproval.length})
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'completion' ? styles.active : ''}`}
                    onClick={() => setFilter('completion')}
                >
                    <i className="fa fa-flag-checkered" style={{ marginInlineEnd: '0.5rem' }} aria-hidden="true"></i>
                    {t('Awaiting Completion')} ({pendingCompletion.length})
                </button>
            </div>

            {/* Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>{t('Project')}</th>
                            <th>{t('Owner')}</th>
                            <th>{t('Category')}</th>
                            <th>{t('Status')}</th>
                            <th>{t('Actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#a0aec0' }}>
                                    <i className="fa fa-inbox" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }} aria-hidden="true"></i>
                                    {t('No pending project requests')}
                                </td>
                            </tr>
                        ) : (
                            filteredProjects.map(project => (
                                <React.Fragment key={project.id}>
                                    <tr>
                                        <td>
                                            <Link
                                                href={`/projects/${project.id}`}
                                                style={{ textDecoration: 'none', color: '#1a202c', fontWeight: 600 }}
                                            >
                                                {project.title}
                                            </Link>
                                            <br />
                                            <small style={{ color: '#718096' }}>
                                                {project.description.slice(0, 60)}...
                                            </small>
                                        </td>
                                        <td>
                                            <strong>{project.creatorName || project.militaryId}</strong>
                                        </td>
                                        <td>{t(project.category)}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${project.status === 'PENDING_APPROVAL' ? styles.pending : styles.development}`}>
                                                {project.status === 'PENDING_APPROVAL' ? t('Awaiting Approval') : t('Awaiting Completion')}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actionBtns}>
                                                <Link
                                                    href={`/projects/${project.id}`}
                                                    className={styles.viewBtn}
                                                    title={t('View project')}
                                                    aria-label={t('View {name}', { name: project.title })}
                                                >
                                                    <i className="fa fa-eye" aria-hidden="true"></i>
                                                </Link>
                                                {project.status === 'PENDING_APPROVAL' && (
                                                    <button
                                                        onClick={() => handleApprove(project.id)}
                                                        disabled={loading === project.id}
                                                        className={styles.approveBtn}
                                                        title={t('Approve')}
                                                        aria-label={t('Approve {name}', { name: project.title })}
                                                    >
                                                        {loading === project.id ? (
                                                            <i className="fa fa-spinner fa-spin"></i>
                                                        ) : (
                                                            <i className="fa fa-check"></i>
                                                        )}
                                                    </button>
                                                )}
                                                {project.status === 'PENDING_COMPLETION' && (
                                                    <button
                                                        onClick={() => handleValidate(project.id)}
                                                        disabled={loading === project.id}
                                                        className={styles.completeBtn}
                                                        title={t('Mark complete')}
                                                        aria-label={t('Mark {name} as completed', { name: project.title })}
                                                    >
                                                        {loading === project.id ? (
                                                            <i className="fa fa-spinner fa-spin"></i>
                                                        ) : (
                                                            <i className="fa fa-trophy"></i>
                                                        )}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setRejectingId(rejectingId === project.id ? null : project.id)}
                                                    className={styles.rejectBtn}
                                                    title={t('Return for revision')}
                                                    aria-label={t('Return {name} for revision', { name: project.title })}
                                                    aria-expanded={rejectingId === project.id}
                                                >
                                                    <i className="fa fa-times" aria-hidden="true"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {rejectingId === project.id && (
                                        <tr key={`${project.id}-reject`}>
                                            <td colSpan={5} style={{ background: '#fef2f2', padding: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <input
                                                        type="text"
                                                        aria-label={t('Reason (shared with the team)')}
                                                        placeholder={t('Reason (shared with the team)')}
                                                        value={rejectReason}
                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                        style={{
                                                            flex: '1 1 220px',
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '8px',
                                                            border: '1px solid #fecaca',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => handleReject(project.id)}
                                                        disabled={loading === project.id}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: '#dc2626',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            fontWeight: 600,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {t('Return for revision')}
                                                    </button>
                                                    <button
                                                        onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: '#e5e7eb',
                                                            color: '#374151',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            fontWeight: 600,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {t('Cancel')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment >
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
