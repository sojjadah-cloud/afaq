'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'
import { createNews, deleteNews } from '@/actions/news'
import { uploadImage } from '@/actions/upload'

export interface NewsItem {
    id: string
    title: string
    summary: string
    imageUrl: string | null
    type: 'NEWS' | 'ACHIEVEMENT'
    eventDate: string | null
    location: string | null
}

type Filter = 'ALL' | 'NEWS' | 'ACHIEVEMENT'

const TABS: { key: Filter; label: string; href: string; icon: string }[] = [
    { key: 'ALL', label: 'All', href: '/news', icon: 'fa-layer-group' },
    { key: 'NEWS', label: 'News', href: '/news/news', icon: 'fa-bullhorn' },
    { key: 'ACHIEVEMENT', label: 'Achievements', href: '/news/achievement', icon: 'fa-trophy' },
]

function formatDate(value: string | null) {
    if (!value) return ''
    const [y, m, d] = String(value).slice(0, 10).split('-').map(Number)
    if (!y || !m || !d) return ''
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface NewsClientProps {
    items: NewsItem[]
    counts: Record<Filter, number>
    active: Filter
    userRole: string | undefined
    isLoggedIn: boolean
}

export default function NewsClient({ items, counts, active, userRole, isLoggedIn }: NewsClientProps) {
    const router = useRouter()
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const canCreate = isLoggedIn && (userRole === 'STAFF' || userRole === 'ADMIN')
    const canDelete = isLoggedIn && userRole === 'ADMIN'

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const imageFile = formData.get('image') as File

        if (imageFile && imageFile.size > 0) {
            const uploadData = new FormData()
            uploadData.set('file', imageFile)
            const uploadResult = await uploadImage(uploadData)
            if (uploadResult.error) {
                setError(uploadResult.error)
                setLoading(false)
                return
            }
            formData.set('imageUrl', uploadResult.url || '')
        }
        formData.delete('image')

        const result = await createNews(formData)
        setLoading(false)
        if (result.error) {
            setError(result.error)
        } else {
            setShowModal(false)
            router.refresh()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this entry?')) return
        const result = await deleteNews(id)
        if (result.error) alert(result.error)
        else router.refresh()
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>News &amp; Achievements</h2>
                <p>Latest updates, milestones and wins from the AFAQ Scientific Club.</p>
                {canCreate && (
                    <button className={styles.createBtn} onClick={() => setShowModal(true)}>
                        <i className="fa fa-plus"></i> Add Entry
                    </button>
                )}
            </div>

            <nav className={styles.tabs} aria-label="Filter">
                {TABS.map(tab => (
                    <Link
                        key={tab.key}
                        href={tab.href}
                        className={`${styles.tab} ${active === tab.key ? styles.tabActive : ''}`}
                        aria-current={active === tab.key ? 'page' : undefined}
                    >
                        <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                        <span className={styles.tabCount}>{counts[tab.key]}</span>
                    </Link>
                ))}
            </nav>

            {items.length === 0 ? (
                <div className={styles.emptyState}>
                    <i className="fa fa-newspaper"></i>
                    <p>No entries yet.</p>
                </div>
            ) : (
                <div className={styles.newsGrid}>
                    {items.map((item, index) => {
                        const isAchievement = item.type === 'ACHIEVEMENT'
                        return (
                            <article key={item.id} id={`news-${item.id}`} className={`${styles.newsCard} ${index === 0 ? styles.featured : ''}`}>
                                <div className={styles.cover}>
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt="" loading={index < 3 ? 'eager' : 'lazy'} />
                                    ) : (
                                        <div className={`${styles.coverFallback} ${isAchievement ? styles.coverFallbackGold : ''}`}>
                                            <i className={`fa-solid ${isAchievement ? 'fa-trophy' : 'fa-bullhorn'}`}></i>
                                        </div>
                                    )}
                                    <span className={`${styles.typeTag} ${isAchievement ? styles.typeTagGold : ''}`}>
                                        <i className={`fa-solid ${isAchievement ? 'fa-trophy' : 'fa-bullhorn'}`}></i>
                                        {isAchievement ? 'Achievement' : 'News'}
                                    </span>
                                </div>
                                <div className={styles.newsBody}>
                                    <h3>{item.title}</h3>
                                    <p className={styles.newsSummary}>{item.summary}</p>
                                    <div className={styles.newsMeta}>
                                        {item.eventDate && (
                                            <span><i className="fa-regular fa-calendar"></i> {formatDate(item.eventDate)}</span>
                                        )}
                                        {item.location && (
                                            <span><i className="fa-solid fa-location-dot"></i> {item.location}</span>
                                        )}
                                        {canDelete && (
                                            <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)} aria-label={`Delete ${item.title}`}>
                                                <i className="fa fa-trash"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Add News / Achievement</h3>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)} aria-label="Close">
                                <i className="fa fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="title">Title *</label>
                                <input type="text" id="title" name="title" required />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="type">Type *</label>
                                    <select id="type" name="type" required defaultValue={active === 'ACHIEVEMENT' ? 'ACHIEVEMENT' : 'NEWS'}>
                                        <option value="NEWS">News</option>
                                        <option value="ACHIEVEMENT">Achievement</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="eventDate">Date</label>
                                    <input type="date" id="eventDate" name="eventDate" />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="location">Location</label>
                                <input type="text" id="location" name="location" placeholder="e.g. Main Auditorium, MTC" />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="summary">Description *</label>
                                <textarea id="summary" name="summary" rows={5} placeholder="What happened?" required></textarea>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="image">Image</label>
                                <input type="file" id="image" name="image" accept=".png,.jpg,.jpeg,.gif,.webp" />
                            </div>

                            {error && <div className={styles.error}>{error}</div>}

                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setShowModal(false)} disabled={loading}>Cancel</button>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? 'Adding...' : 'Add Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
