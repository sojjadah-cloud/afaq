'use client'

import {
    joinProject, editProject, addAttachment, approveMember,
    requestApproval, requestCompletion, transferOwnership
} from '@/actions/projects'
import { deleteProject } from '@/actions/admin'
import { useState, useEffect } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import MarkdownEditor from '@/components/MarkdownEditor'
import { compressImage } from '@/lib/image-compression'
import { useT } from '@/i18n/client'

interface ApprovedMember {
    userId: string
    fullName: string
    militaryId: string
    role: string
}

export default function ProjectActions({
    projectId,
    isOwner,
    isMember,
    initialTitle,
    initialDescription,
    memberStatus,
    pendingMembers,
    projectStatus,
    approvedMembers = [],
    isAdmin = false
}: {
    projectId: string
    isOwner: boolean
    isMember: boolean
    memberStatus?: string
    pendingMembers: any[]
    initialTitle?: string
    initialDescription?: string
    projectStatus: string
    approvedMembers?: ApprovedMember[]
    isAdmin?: boolean
}) {
    const [isEditing, setIsEditing] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [fileName, setFileName] = useState('')
    const [loading, setLoading] = useState<string | null>(null)
    const [showTransfer, setShowTransfer] = useState(false)
    const router = useRouter()
    const t = useT()

    const isCompleted = projectStatus === 'COMPLETED'
    const isPending = projectStatus === 'PENDING_APPROVAL' || projectStatus === 'PENDING_COMPLETION'
    const canEdit = isOwner && !isCompleted && !isPending

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsEditing(false)
                setShowTransfer(false)
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [])

    async function handleJoin() {
        if (!confirm(t('Request to join this project?'))) return
        const result: { error?: string } = await joinProject(projectId).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        alert(result?.error ? t(result.error) : t('Request sent!'))
        router.refresh()
    }

    async function handleApprove(userId: string) {
        await approveMember(projectId, userId)
        router.refresh()
    }

    async function handleRequestApproval() {
        if (!confirm(t('Submit this project for admin approval? Once submitted, you cannot make changes until approved.'))) return
        setLoading('approval')
        const result = await requestApproval(projectId)
        if (result.error) alert(t(result.error))
        else alert(t('Project submitted for approval!'))
        setLoading(null)
        router.refresh()
    }

    async function handleRequestCompletion() {
        if (!confirm(t('Request to mark this project as complete? An admin will review and finalize.'))) return
        setLoading('completion')
        const result = await requestCompletion(projectId)
        if (result.error) alert(t(result.error))
        else alert(t('Completion request submitted!'))
        setLoading(null)
        router.refresh()
    }

    async function handleTransferOwnership(newOwnerId: string) {
        if (!confirm(t('Are you sure you want to transfer ownership? You will become a regular member.'))) return
        setLoading('transfer')
        const result = await transferOwnership(projectId, newOwnerId)
        if (result.error) alert(t(result.error))
        else {
            alert(t('Ownership transferred successfully!'))
            setShowTransfer(false)
        }
        setLoading(null)
        router.refresh()
    }

    async function handleUpload(formData: FormData) {
        if (!fileName) return
        setIsUploading(true)

        try {
            const file = formData.get('file') as File
            if (file) {
                const compressed = await compressImage(file)
                formData.set('file', compressed)
            }

            const result = await addAttachment(projectId, formData)
            if (result?.error) {
                alert(t(result.error))
                return
            }
            setFileName('')
            router.refresh()
        } catch (error) {
            console.error('Upload failed', error)
            alert(t('Upload failed'))
        } finally {
            setIsUploading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name)
        }
    }

    async function handleDelete() {
        if (!confirm(t('Delete this project permanently? Its members, attachments and files will also be removed. This cannot be undone.'))) return
        setLoading('delete')
        const result = await deleteProject(projectId)
        if (result.error) {
            alert(t(result.error))
            setLoading(null)
            return
        }
        router.push('/projects')
        router.refresh()
    }

    // Filter approved members (exclude current owner)
    const transferableMembers = approvedMembers.filter(m => m.role !== 'Owner')

    return (
        <div className={styles.actionContainer}>
            {/* Status Badge for Pending States */}
            {projectStatus === 'PENDING_APPROVAL' && (
                <div style={{
                    padding: '1rem', background: '#fef3c7', color: '#92400e',
                    borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, textAlign: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}>
                    <i className="fa-solid fa-clock" aria-hidden="true"></i> {t('Awaiting Admin Approval')}
                </div>
            )}
            {projectStatus === 'PENDING_COMPLETION' && (
                <div style={{
                    padding: '1rem', background: '#dbeafe', color: '#1e40af',
                    borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, textAlign: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}>
                    <i className="fa-solid fa-hourglass-half" aria-hidden="true"></i> {t('Awaiting Completion Validation')}
                </div>
            )}

            {/* Join Action */}
            {!isMember && !isOwner && (
                <button
                    onClick={handleJoin}
                    className={styles.joinBtn}
                    disabled={memberStatus === 'PENDING' || isCompleted}
                >
                    {memberStatus === 'PENDING' ? (
                        <><i className="fa-solid fa-clock" aria-hidden="true"></i> {t('Request Pending')}</>
                    ) : isCompleted ? (
                        <><i className="fa-solid fa-lock" aria-hidden="true"></i> {t('Project Completed')}</>
                    ) : (
                        <><i className="fa-solid fa-user-plus" aria-hidden="true"></i> {t('Join Project')}</>
                    )}
                </button>
            )}

            {/* Owner Actions */}
            {isOwner && (
                <div className={styles.ownerActions}>
                    {isCompleted ? (
                        <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, textAlign: 'center' }}>
                            <i className="fa-solid fa-trophy" aria-hidden="true"></i> {t('This project is completed and locked.')}
                        </div>
                    ) : isPending ? (
                        <div style={{ padding: '0.75rem', background: '#f1f5f9', color: '#64748b', borderRadius: '10px', fontSize: '0.9rem', textAlign: 'center' }}>
                            <i className="fa-solid fa-info-circle" aria-hidden="true"></i> {t('Cannot edit while pending admin review.')}
                        </div>
                    ) : (
                        <>
                            {/* Workflow Buttons */}
                            {projectStatus === 'START' && (
                                <button
                                    onClick={handleRequestApproval}
                                    disabled={loading === 'approval'}
                                    style={{
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        color: 'white', border: 'none', padding: '1rem',
                                        borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        width: '100%', fontSize: '1rem'
                                    }}
                                >
                                    <i className={loading === 'approval' ? 'fa fa-spinner fa-spin' : 'fa-solid fa-rocket'}></i>
                                    {loading === 'approval' ? t('Submitting...') : t('Get Started - Submit for Approval')}
                                </button>
                            )}

                            {projectStatus === 'DEVELOPMENT' && (
                                <button
                                    onClick={handleRequestCompletion}
                                    disabled={loading === 'completion'}
                                    style={{
                                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                        color: 'white', border: 'none', padding: '1rem',
                                        borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        width: '100%', fontSize: '1rem'
                                    }}
                                >
                                    <i className={loading === 'completion' ? 'fa fa-spinner fa-spin' : 'fa-solid fa-flag-checkered'}></i>
                                    {loading === 'completion' ? t('Submitting...') : t('Request Finalize')}
                                </button>
                            )}

                            <div className={styles.divider}></div>

                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`${styles.actionBtn} ${isEditing ? styles.active : ''}`}
                            >
                                <i className={`fa-solid ${isEditing ? 'fa-times' : 'fa-pen'}`}></i>
                                {isEditing ? t('Cancel Editing') : t('Edit Details')}
                            </button>

                            {/* Edit Form */}
                            <div className={`${styles.editSection} ${isEditing ? styles.expanded : ''}`}>
                                <form onSubmit={async (e) => {
                                    // Not a form action: those reset the form, losing edits when the save fails.
                                    e.preventDefault()
                                    const result = await editProject(projectId, new FormData(e.currentTarget))
                                    if (result?.error) {
                                        alert(t(result.error))
                                    } else {
                                        setIsEditing(false)
                                    }
                                }} className={styles.editForm}>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className={styles.closeBtn}
                                        aria-label={t('Close')}
                                    >
                                        <i className="fa-solid fa-times" aria-hidden="true"></i>
                                    </button>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="edit-title">{t('Project Title')}</label>
                                        <input
                                            id="edit-title"
                                            name="title"
                                            defaultValue={initialTitle}
                                            required
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>{t('Description')}</label>
                                        <MarkdownEditor
                                            name="description"
                                            value={initialDescription}
                                            required
                                            placeholder={t('Use Markdown to format your description. Insert tables, images, lists, etc.')}
                                            maxWords={1000}
                                        />
                                    </div>
                                    <button type="submit" className={styles.saveBtn}>
                                        <i className="fa-solid fa-save" aria-hidden="true"></i> {t('Save Changes')}
                                    </button>
                                </form>
                            </div>

                            <div className={styles.divider}></div>

                            <div className={styles.uploadSection}>
                                <h4><i className="fa-solid fa-paperclip" aria-hidden="true"></i> {t('Add Attachment')}</h4>
                                <form action={handleUpload} className={styles.uploadForm}>
                                    <div className={styles.fileUploadWrapper}>
                                        <input
                                            type="file"
                                            name="file"
                                            id="file-upload"
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg,.jpeg,.gif,.webp"
                                            onChange={handleFileChange}
                                            className={styles.fileInput}
                                        />
                                        <label htmlFor="file-upload" className={styles.fileLabel}>
                                            <i className="fa-solid fa-cloud-upload-alt"></i>
                                            {fileName || t('Choose a file...')}
                                        </label>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isUploading || !fileName}
                                        className={styles.uploadBtn}
                                    >
                                        {isUploading ? t('Uploading...') : t('Upload')}
                                    </button>
                                </form>
                                <p className={styles.uploadHint}>{t('PDF, Word, PowerPoint, Excel, ZIP or images, up to 25 MB.')}</p>
                            </div>

                            {/* Transfer Ownership */}
                            {transferableMembers.length > 0 && (
                                <>
                                    <div className={styles.divider}></div>
                                    <div>
                                        <button
                                            onClick={() => setShowTransfer(!showTransfer)}
                                            className={styles.actionBtn}
                                            style={{ background: showTransfer ? '#fef2f2' : undefined }}
                                        >
                                            <i className="fa-solid fa-exchange-alt" aria-hidden="true"></i> {t('Transfer Ownership')}
                                        </button>
                                        {showTransfer && (
                                            <div style={{ marginTop: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px' }}>
                                                <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#64748b' }}>
                                                    {t('Select a member to become the new owner:')}
                                                </p>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {transferableMembers.map(member => (
                                                        <button
                                                            key={member.userId}
                                                            onClick={() => handleTransferOwnership(member.userId)}
                                                            disabled={loading === 'transfer'}
                                                            style={{
                                                                padding: '0.75rem', background: 'white', border: '1px solid #e2e8f0',
                                                                borderRadius: '8px', cursor: 'pointer', textAlign: 'start',
                                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                                            }}
                                                        >
                                                            <span style={{ fontWeight: 600 }}>{member.fullName || member.militaryId}</span>
                                                            <i className="fa-solid fa-arrow-right" style={{ color: '#94a3b8' }}></i>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {pendingMembers.length > 0 && !isCompleted && (
                        <div className={styles.pendingSection}>
                            <h4><i className="fa-solid fa-users-cog" aria-hidden="true"></i> {t('Pending Requests')}</h4>
                            <div className={styles.pendingList}>
                                {pendingMembers.map(m => (
                                    <div key={m.userId} className={styles.pendingItem}>
                                        <span className={styles.pendingName}>
                                            {m.fullName || m.militaryId}
                                        </span>
                                        <button
                                            onClick={() => handleApprove(m.userId)}
                                            className={styles.approveBtn}
                                            title={t('Approve Member')}
                                            aria-label={t('Approve {name}', { name: m.fullName || m.militaryId })}
                                        >
                                            <i className="fa-solid fa-check" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isAdmin && (
                <div className={styles.dangerZone}>
                    <h4><i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> {t('Administrator')}</h4>
                    <button type="button" onClick={handleDelete} disabled={loading === 'delete'} className={styles.deleteProjectBtn}>
                        <i className={loading === 'delete' ? 'fa fa-spinner fa-spin' : 'fa-solid fa-trash'}></i>
                        {loading === 'delete' ? t('Deleting...') : t('Delete project')}
                    </button>
                </div>
            )}
        </div>
    )
}
