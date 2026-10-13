'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import { createProject } from '@/actions/projects'
import { useRouter } from 'next/navigation'

const FORM_TEMPLATE_URL = '/forms/AFAQ-Project-Application-Form.docx'
const MAX_FORM_MB = 25
const FORM_EXTENSIONS = ['pdf', 'doc', 'docx']

interface ProjectsPageProps {
    initialCounts: {
        start: number
        development: number
        completed: number
    }
    sections: { slug: string; name: string }[]
    openCreate?: boolean
    initialSection?: string
}

function formatSize(bytes: number) {
    return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function ProjectsPage({ initialCounts, sections, openCreate = false, initialSection = '' }: ProjectsPageProps) {
    const router = useRouter()
    const [showModal, setShowModal] = useState(openCreate)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [formFile, setFormFile] = useState<File | null>(null)
    const [dragging, setDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const pickFile = (file: File | undefined) => {
        setError('')
        if (!file) {
            setFormFile(null)
            return
        }
        const ext = (file.name.split('.').pop() || '').toLowerCase()
        if (!FORM_EXTENSIONS.includes(ext)) {
            setError('The application form must be a PDF or Word file (.pdf, .doc, .docx).')
            setFormFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }
        if (file.size > MAX_FORM_MB * 1024 * 1024) {
            setError(`The application form is too large. Maximum size is ${MAX_FORM_MB} MB.`)
            setFormFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }
        setFormFile(file)
    }

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file && fileInputRef.current) {
            const transfer = new DataTransfer()
            transfer.items.add(file)
            fileInputRef.current.files = transfer.files
        }
        pickFile(file)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        if (!formFile) {
            setError('Please attach the completed application form.')
            return
        }
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const result = await createProject(formData)

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else if (result.success && result.projectId) {
            setShowModal(false)
            router.push(`/projects/${result.projectId}`)
            router.refresh()
        }
    }

    return (
        <main className={styles.main}>
            <div className={styles.pageHeader}>
                <div>
                    <h2>Innovation Projects</h2>
                    <p>
                        Browse projects by stage: new ideas (Start), active development, or completed innovations.
                    </p>
                </div>
                <button className={styles.createBtn} onClick={() => setShowModal(true)}>
                    <i className="fa fa-plus"></i> Submit a Project
                </button>
            </div>

            <section className={styles.statusGrid}>
                <Link href="/projects/start" className={`${styles.statusCard} animate-delay-1`}>
                    <div className={styles.statusIcon}>
                        <i className="fa-solid fa-rocket"></i>
                    </div>
                    <div className={styles.statusTitle}>Start</div>
                    <div className={styles.statusCount}>{initialCounts.start} projects</div>
                    <div className={styles.statusDesc}>New ideas and early-stage concepts</div>
                </Link>

                <Link href="/projects/development" className={`${styles.statusCard} animate-delay-2`}>
                    <div className={styles.statusIcon}>
                        <i className="fa-solid fa-diagram-project"></i>
                    </div>
                    <div className={styles.statusTitle}>In Development</div>
                    <div className={styles.statusCount}>{initialCounts.development} projects</div>
                    <div className={styles.statusDesc}>Active projects under construction</div>
                </Link>

                <Link href="/projects/completed" className={`${styles.statusCard} animate-delay-3`}>
                    <div className={styles.statusIcon}>
                        <i className="fa-solid fa-circle-check"></i>
                    </div>
                    <div className={styles.statusTitle}>Completed</div>
                    <div className={styles.statusCount}>{initialCounts.completed} projects</div>
                    <div className={styles.statusDesc}>Finished and documented innovations</div>
                </Link>
            </section>

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Submit a New Project</h3>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)} aria-label="Close">
                                <i className="fa fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.projectForm}>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>1</div>
                                <div className={styles.stepBody}>
                                    <h4>Download the application form</h4>
                                    <p>Fill in the project details, team members, resources and timeline, and get your supervisor&apos;s signature.</p>
                                    <a href={FORM_TEMPLATE_URL} download className={styles.downloadBtn}>
                                        <i className="fa-solid fa-file-word"></i> Download Application Form (.docx)
                                    </a>
                                </div>
                            </div>

                            <div className={styles.step}>
                                <div className={styles.stepNumber}>2</div>
                                <div className={styles.stepBody}>
                                    <h4>Project details</h4>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="title">Project Title *</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder="Enter project title (max 200 characters)"
                                    maxLength={200}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="description">Description *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Describe your project (max 1000 words, markdown supported)"
                                    rows={6}
                                    required
                                ></textarea>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="section">Department *</label>
                                <select id="section" name="section" required defaultValue={initialSection}>
                                    <option value="">Select the department or Scientific Club</option>
                                    {sections.map(s => (
                                        <option key={s.slug} value={s.slug}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="category">Innovation Track *</label>
                                    <select id="category" name="category" required>
                                        <option value="">Select category</option>
                                        <option value="Cybersecurity">Cybersecurity</option>
                                        <option value="IoT">IoT</option>
                                        <option value="AI">Artificial Intelligence</option>
                                        <option value="Robotics">Robotics</option>
                                        <option value="Sustainability">Sustainability</option>
                                        <option value="Smart Logistics">Smart Logistics</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="status">Initial Status</label>
                                    <select id="status" name="status" defaultValue="START">
                                        <option value="START">Start</option>
                                        <option value="DEVELOPMENT">Development</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.step}>
                                <div className={styles.stepNumber}>3</div>
                                <div className={styles.stepBody}>
                                    <h4>Attach the completed form *</h4>
                                </div>
                            </div>

                            <label
                                htmlFor="applicationForm"
                                className={`${styles.dropZone} ${dragging ? styles.dropZoneActive : ''} ${formFile ? styles.dropZoneFilled : ''}`}
                                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="applicationForm"
                                    name="applicationForm"
                                    accept=".pdf,.doc,.docx"
                                    className={styles.hiddenInput}
                                    onChange={e => pickFile(e.target.files?.[0])}
                                />
                                {formFile ? (
                                    <>
                                        <i className="fa-solid fa-file-circle-check"></i>
                                        <span className={styles.dropTitle}>{formFile.name}</span>
                                        <span className={styles.dropHint}>{formatSize(formFile.size)} · click to choose a different file</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-paperclip"></i>
                                        <span className={styles.dropTitle}>Click to attach, or drag the file here</span>
                                        <span className={styles.dropHint}>PDF or Word (.pdf, .doc, .docx), up to {MAX_FORM_MB} MB</span>
                                    </>
                                )}
                            </label>

                            {error && <div className={styles.errorMessage}>{error}</div>}

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={() => setShowModal(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
