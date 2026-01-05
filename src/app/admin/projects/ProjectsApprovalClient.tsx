'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminApproveProject, adminValidateCompletion, adminRejectProject } from '@/actions/projects'

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
    const router = useRouter()

    const pendingApproval = projects.filter(p => p.status === 'PENDING_APPROVAL')
    const pendingCompletion = projects.filter(p => p.status === 'PENDING_COMPLETION')

    async function handleApprove(projectId: string) {
        if (!confirm('Approve this project to start development?')) return
        setLoading(projectId)
        const result = await adminApproveProject(projectId)
        if (result.error) alert(result.error)
        setLoading(null)
        router.refresh()
    }

    async function handleValidate(projectId: string) {
        if (!confirm('Mark this project as completed?')) return
        setLoading(projectId)
        const result = await adminValidateCompletion(projectId)
        if (result.error) alert(result.error)
        setLoading(null)
        router.refresh()
    }

    async function handleReject(projectId: string) {
        setLoading(projectId)
        const result = await adminRejectProject(projectId, rejectReason)
        if (result.error) alert(result.error)
        setRejectingId(null)
        setRejectReason('')
        setLoading(null)
        router.refresh()
    }

    const cardStyle = {
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        marginBottom: '1rem'
    }

    const buttonStyle = (color: string, disabled: boolean) => ({
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        border: 'none',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        opacity: disabled ? 0.6 : 1,
        background: color,
        color: 'white'
    })

    return (
        <div>
            {projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#a0aec0' }}>
                    <i className="fa-solid fa-inbox" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                    <p>No pending project requests.</p>
                </div>
            ) : (
                <>
                    {/* Pending Approval Section */}
                    {pendingApproval.length > 0 && (
                        <section style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#c05621', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fa-solid fa-clock"></i> Awaiting Approval ({pendingApproval.length})
                            </h2>
                            {pendingApproval.map(project => (
                                <div key={project.id} style={cardStyle}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1a202c' }}>{project.title}</h3>
                                            </Link>
                                            <p style={{ margin: '0.5rem 0', color: '#718096', fontSize: '0.9rem' }}>
                                                <span style={{ fontWeight: 600 }}>{project.creatorName || project.militaryId}</span> • {project.category}
                                            </p>
                                            <p style={{ margin: 0, color: '#4a5568', fontSize: '0.9rem' }}>
                                                {project.description.slice(0, 200)}...
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => handleApprove(project.id)}
                                                disabled={loading === project.id}
                                                style={buttonStyle('#10b981', loading === project.id)}
                                            >
                                                <i className={loading === project.id ? 'fa fa-spinner fa-spin' : 'fa-solid fa-check'}></i>
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => setRejectingId(project.id)}
                                                style={buttonStyle('#ef4444', false)}
                                            >
                                                <i className="fa-solid fa-times"></i> Reject
                                            </button>
                                        </div>
                                    </div>
                                    {rejectingId === project.id && (
                                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', borderRadius: '8px' }}>
                                            <input
                                                type="text"
                                                placeholder="Reason for rejection (optional)"
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #fecaca', marginBottom: '0.5rem' }}
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleReject(project.id)} style={buttonStyle('#dc2626', loading === project.id)}>
                                                    Confirm Reject
                                                </button>
                                                <button onClick={() => { setRejectingId(null); setRejectReason(''); }} style={{ ...buttonStyle('#6b7280', false), background: '#e5e7eb', color: '#374151' }}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Pending Completion Section */}
                    {pendingCompletion.length > 0 && (
                        <section>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e40af', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fa-solid fa-flag-checkered"></i> Awaiting Completion Validation ({pendingCompletion.length})
                            </h2>
                            {pendingCompletion.map(project => (
                                <div key={project.id} style={cardStyle}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1a202c' }}>{project.title}</h3>
                                            </Link>
                                            <p style={{ margin: '0.5rem 0', color: '#718096', fontSize: '0.9rem' }}>
                                                <span style={{ fontWeight: 600 }}>{project.creatorName || project.militaryId}</span> • {project.category}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => handleValidate(project.id)}
                                                disabled={loading === project.id}
                                                style={buttonStyle('#8b5cf6', loading === project.id)}
                                            >
                                                <i className={loading === project.id ? 'fa fa-spinner fa-spin' : 'fa-solid fa-trophy'}></i>
                                                Mark Complete
                                            </button>
                                            <button
                                                onClick={() => setRejectingId(project.id)}
                                                style={buttonStyle('#ef4444', false)}
                                            >
                                                <i className="fa-solid fa-times"></i> Reject
                                            </button>
                                        </div>
                                    </div>
                                    {rejectingId === project.id && (
                                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', borderRadius: '8px' }}>
                                            <input
                                                type="text"
                                                placeholder="Reason for rejection (optional)"
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #fecaca', marginBottom: '0.5rem' }}
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleReject(project.id)} style={buttonStyle('#dc2626', loading === project.id)}>
                                                    Confirm Reject
                                                </button>
                                                <button onClick={() => { setRejectingId(null); setRejectReason(''); }} style={{ ...buttonStyle('#6b7280', false), background: '#e5e7eb', color: '#374151' }}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}
                </>
            )}
        </div>
    )
}
