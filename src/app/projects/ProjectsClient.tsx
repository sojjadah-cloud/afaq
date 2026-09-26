'use client'

import { useEffect, useState } from 'react'
import { query } from '@/lib/db'
import Link from 'next/link'
import styles from './page.module.css'
import { RowDataPacket } from 'mysql2'
import { createProject } from '@/actions/projects'
import { useRouter } from 'next/navigation'

interface CountResult extends RowDataPacket {
    count: number
}

interface ProjectsPageProps {
    initialCounts: {
        start: number
        development: number
        completed: number
    }
}

export default function ProjectsPage({ initialCounts }: ProjectsPageProps) {
    const router = useRouter()
    const [showModal, setShowModal] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
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
                    <i className="fa fa-plus"></i> Create Project
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
                            <h3>Create New Project</h3>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.projectForm}>
                            {error && <div className={styles.errorMessage}>{error}</div>}

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

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="category">Category *</label>
                                    <select id="category" name="category" required>
                                        <option value="">Select category</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Research">Research</option>
                                        <option value="Design">Design</option>
                                        <option value="Engineering">Engineering</option>
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
                                    {loading ? 'Creating...' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
