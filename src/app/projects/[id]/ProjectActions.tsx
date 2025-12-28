'use client'

import { joinProject, editProject, addAttachment, approveMember } from '@/actions/projects'
import { useState, useEffect } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import MarkdownEditor from '@/components/MarkdownEditor'
import { compressImage } from '@/lib/image-compression'

export default function ProjectActions({
    projectId,
    isOwner,
    isMember,
    initialTitle,
    initialDescription,
    memberStatus,
    pendingMembers,
    projectStatus
}: {
    projectId: string
    isOwner: boolean
    isMember: boolean
    memberStatus?: string
    pendingMembers: any[]
    initialTitle?: string
    initialDescription?: string
    projectStatus: string
}) {
    const [isEditing, setIsEditing] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [fileName, setFileName] = useState('')
    const router = useRouter()

    const isCompleted = projectStatus === 'COMPLETED'

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsEditing(false)
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [])

    async function handleJoin() {
        if (!confirm('Request to join this project?')) return
        await joinProject(projectId)
        alert('Request sent!')
        router.refresh()
    }

    async function handleApprove(userId: string) {
        await approveMember(projectId, userId)
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

            formData.append('projectId', projectId)
            await addAttachment(projectId, formData)
            setFileName('')
            router.refresh()
        } catch (error) {
            console.error('Upload failed', error)
            alert('Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name)
        }
    }

    return (
        <div className={styles.actionContainer}>
            {/* Join Action */}
            {!isMember && !isOwner && (
                <button
                    onClick={handleJoin}
                    className={styles.joinBtn}
                    disabled={memberStatus === 'PENDING' || isCompleted}
                >
                    {memberStatus === 'PENDING' ? (
                        <><i className="fa-solid fa-clock"></i> Request Pending</>
                    ) : isCompleted ? (
                        <><i className="fa-solid fa-lock"></i> Project Completed</>
                    ) : (
                        <><i className="fa-solid fa-user-plus"></i> Join Project</>
                    )}
                </button>
            )}

            {/* Owner Actions */}
            {isOwner && (
                <div className={styles.ownerActions}>
                    {isCompleted ? (
                        <div style={{ padding: '1rem', background: '#ebf8ff', color: '#2b6cb0', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, textAlign: 'center' }}>
                            <i className="fa-solid fa-check-circle"></i> This project is completed and locked.
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`${styles.actionBtn} ${isEditing ? styles.active : ''}`}
                            >
                                <i className={`fa-solid ${isEditing ? 'fa-times' : 'fa-pen'}`}></i>
                                {isEditing ? 'Cancel Editing' : 'Edit Details'}
                            </button>

                            {/* Edit Form */}
                            <div className={`${styles.editSection} ${isEditing ? styles.expanded : ''}`}>
                                <form action={async (formData) => {
                                    const result = await editProject(projectId, formData)
                                    if (result?.error) {
                                        alert(result.error)
                                    } else {
                                        setIsEditing(false)
                                    }
                                }} className={styles.editForm}>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className={styles.closeBtn}
                                    >
                                        <i className="fa-solid fa-times"></i>
                                    </button>
                                    <div className={styles.formGroup}>
                                        <label>Project Title</label>
                                        <input
                                            name="title"
                                            defaultValue={initialTitle}
                                            required
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Description</label>
                                        <MarkdownEditor
                                            name="description"
                                            value={initialDescription}
                                            required
                                            placeholder="Use Markdown to format your description. Insert tables, images, lists, etc."
                                            maxWords={1000}
                                        />
                                    </div>
                                    <button type="submit" className={styles.saveBtn}>
                                        <i className="fa-solid fa-save"></i> Save Changes
                                    </button>
                                </form>
                            </div>

                            <div className={styles.divider}></div>

                            <div className={styles.uploadSection}>
                                <h4><i className="fa-solid fa-paperclip"></i> Add Attachment</h4>
                                <form action={handleUpload} className={styles.uploadForm}>
                                    <div className={styles.fileUploadWrapper}>
                                        <input
                                            type="file"
                                            name="file"
                                            id="file-upload"
                                            onChange={handleFileChange}
                                            className={styles.fileInput}
                                        />
                                        <label htmlFor="file-upload" className={styles.fileLabel}>
                                            <i className="fa-solid fa-cloud-upload-alt"></i>
                                            {fileName || 'Choose a file...'}
                                        </label>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isUploading || !fileName}
                                        className={styles.uploadBtn}
                                    >
                                        {isUploading ? 'Uploading...' : 'Upload'}
                                    </button>
                                </form>
                            </div>
                        </>
                    )}

                    {pendingMembers.length > 0 && (
                        <div className={styles.pendingSection}>
                            <h4><i className="fa-solid fa-users-cog"></i> Pending Requests</h4>
                            <div className={styles.pendingList}>
                                {pendingMembers.map(m => (
                                    <div key={m.userId} className={styles.pendingItem}>
                                        <span className={styles.pendingName}>
                                            {m.fullName || m.militaryId}
                                        </span>
                                        <button
                                            onClick={() => handleApprove(m.userId)}
                                            className={styles.approveBtn}
                                            title="Approve Member"
                                            disabled={isCompleted}
                                        >
                                            <i className="fa-solid fa-check"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
