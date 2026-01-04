'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { createResearch, deleteResearch } from '@/actions/research'

interface Research {
    id: string
    title: string
    abstract: string
    authors: string
    category: string
    publicationDate: string | null
    url: string | null
    createdAt: string
}

interface ResearchClientProps {
    initialResearch: Research[]
    userRole: string | undefined
    isLoggedIn: boolean
}

export default function ResearchClient({ initialResearch, userRole, isLoggedIn }: ResearchClientProps) {
    const router = useRouter()
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [filter, setFilter] = useState('all')

    const canCreate = isLoggedIn && (userRole === 'STAFF' || userRole === 'ADMIN')
    const canDelete = isLoggedIn && userRole === 'ADMIN'

    const categories = ['Published', 'Ongoing', 'Thesis', 'Conference', 'Patent']

    const filteredResearch = filter === 'all'
        ? initialResearch
        : initialResearch.filter(r => r.category === filter)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const result = await createResearch(formData)

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setShowModal(false)
            setLoading(false)
            router.refresh()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this research entry?')) return

        const result = await deleteResearch(id)
        if (result.error) {
            alert(result.error)
        } else {
            router.refresh()
        }
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>Research Hub</h2>
                <p>Academic research, publications, theses, and ongoing scholarly work within AFAQ.</p>
                {canCreate && (
                    <button className={styles.createBtn} onClick={() => setShowModal(true)}>
                        <i className="fa fa-plus"></i> Add Research
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className={styles.filterTabs}>
                <button
                    className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({initialResearch.length})
                </button>
                {categories.map(cat => {
                    const count = initialResearch.filter(r => r.category === cat).length
                    if (count === 0) return null
                    return (
                        <button
                            key={cat}
                            className={`${styles.filterTab} ${filter === cat ? styles.active : ''}`}
                            onClick={() => setFilter(cat)}
                        >
                            {cat} ({count})
                        </button>
                    )
                })}
            </div>

            {/* Research Grid */}
            <div className={styles.grid}>
                {filteredResearch.length === 0 ? (
                    <div className={styles.emptyState}>
                        <i className="fa fa-scroll"></i>
                        <p>No research entries found.</p>
                        {canCreate && <p>Click "Add Research" to create the first entry.</p>}
                    </div>
                ) : (
                    filteredResearch.map((research, index) => (
                        <div key={research.id} className={`${styles.card} ${styles[`animateDelay${(index % 3) + 1}`]}`}>
                            <div className={styles.cardContent}>
                                <div className={styles.category}>{research.category}</div>
                                <h3>{research.title}</h3>
                                <p className={styles.authors}>
                                    <i className="fa fa-users"></i> {research.authors}
                                </p>
                                <p className={styles.abstract}>
                                    {research.abstract.length > 200
                                        ? research.abstract.substring(0, 200) + '...'
                                        : research.abstract}
                                </p>
                                <div className={styles.cardFooter}>
                                    {research.publicationDate && (
                                        <span className={styles.date}>
                                            <i className="fa fa-calendar"></i>
                                            {new Date(research.publicationDate).toLocaleDateString()}
                                        </span>
                                    )}
                                    {research.url && (
                                        <a href={research.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                            <i className="fa fa-external-link"></i> View
                                        </a>
                                    )}
                                    {canDelete && (
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDelete(research.id)}
                                        >
                                            <i className="fa fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Add New Research</h3>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            {error && <div className={styles.error}>{error}</div>}

                            <div className={styles.formGroup}>
                                <label htmlFor="title">Title *</label>
                                <input type="text" id="title" name="title" required />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="authors">Authors *</label>
                                <input
                                    type="text"
                                    id="authors"
                                    name="authors"
                                    placeholder="e.g., John Doe, Jane Smith"
                                    required
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="category">Category *</label>
                                    <select id="category" name="category" required>
                                        <option value="">Select category</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="publicationDate">Publication Date</label>
                                    <input type="date" id="publicationDate" name="publicationDate" />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="abstract">Abstract *</label>
                                <textarea
                                    id="abstract"
                                    name="abstract"
                                    rows={5}
                                    placeholder="Brief summary of the research..."
                                    required
                                ></textarea>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="url">External URL (optional)</label>
                                <input
                                    type="url"
                                    id="url"
                                    name="url"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setShowModal(false)} disabled={loading}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? 'Adding...' : 'Add Research'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
