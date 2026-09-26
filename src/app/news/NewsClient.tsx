'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'
import { createNews } from '@/actions/news'
import { uploadImage } from '@/actions/upload'

interface NewsItem {
    id: string
    title: string
    summary: string
    type: 'NEWS' | 'ACHIEVEMENT'
    eventDate: string | null
    createdAt: string
}

interface NewsClientProps {
    initialNews: NewsItem[]
    userRole: string | undefined
    isLoggedIn: boolean
}

const TYPE_META = {
    NEWS: { label: 'News', icon: 'fa-bullhorn', desc: 'Announcements and updates from AFAQ' },
    ACHIEVEMENT: { label: 'Achievements', icon: 'fa-trophy', desc: 'Wins, awards, and milestones' },
}

export default function NewsClient({ initialNews, userRole, isLoggedIn }: NewsClientProps) {
    const router = useRouter()
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const canCreate = isLoggedIn && (userRole === 'STAFF' || userRole === 'ADMIN')

    const newsCount = initialNews.filter(n => n.type === 'NEWS').length
    const achievementCount = initialNews.filter(n => n.type === 'ACHIEVEMENT').length

    const groups = [
        { type: 'NEWS' as const, count: newsCount },
        { type: 'ACHIEVEMENT' as const, count: achievementCount },
    ]

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

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setShowModal(false)
            setLoading(false)
            router.refresh()
        }
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>News &amp; Achievements</h2>
                <p>Latest updates, milestones, and wins from the AFAQ Scientific Club.</p>
                {canCreate && (
                    <button className={styles.createBtn} onClick={() => setShowModal(true)}>
                        <i className="fa fa-plus"></i> Add Entry
                    </button>
                )}
            </div>

            {initialNews.length === 0 ? (
                <div className={styles.emptyState}>
                    <i className="fa fa-newspaper"></i>
                    <p>No entries found.</p>
                    {canCreate && <p>Click &quot;Add Entry&quot; to post the first update.</p>}
                </div>
            ) : (
                <div className={styles.groupGrid}>
                    {groups.map(group => (
                        <Link
                            key={group.type}
                            href={`/news/${group.type.toLowerCase()}`}
                            className={`${styles.groupCard} ${group.type === 'ACHIEVEMENT' ? styles.achievementGroupCard : ''}`}
                        >
                            <div className={styles.groupIcon}>
                                <i className={`fa-solid ${TYPE_META[group.type].icon}`}></i>
                            </div>
                            <div className={styles.groupTitle}>{TYPE_META[group.type].label}</div>
                            <div className={styles.groupDesc}>{TYPE_META[group.type].desc}</div>
                            <div className={styles.groupCount}>{group.count} {group.count === 1 ? 'entry' : 'entries'}</div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Add News / Achievement</h3>
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

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="type">Type *</label>
                                    <select id="type" name="type" required defaultValue="NEWS">
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
                                <label htmlFor="summary">Summary *</label>
                                <textarea
                                    id="summary"
                                    name="summary"
                                    rows={5}
                                    placeholder="What happened?"
                                    required
                                ></textarea>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="image">Image (optional)</label>
                                <input type="file" id="image" name="image" accept="image/*" />
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setShowModal(false)} disabled={loading}>
                                    Cancel
                                </button>
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
