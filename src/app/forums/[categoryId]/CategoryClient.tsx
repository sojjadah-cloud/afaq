'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../page.module.css'
import { createForumTopic } from '@/actions/forum'

interface Topic {
    id: string
    title: string
    content: string
    authorName: string
    authorMilitaryId: string
    replyCount: number
    viewCount: number
    isPinned: boolean
    createdAt: string
    lastActivity: string
}

interface CategoryClientProps {
    category: any
    topics: Topic[]
    isLoggedIn: boolean
}

export default function CategoryClient({ category, topics, isLoggedIn }: CategoryClientProps) {
    const router = useRouter()
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.append('categoryId', category.id)

        const result = await createForumTopic(formData)

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setShowModal(false)
            setLoading(false)
            router.refresh()
        }
    }

    const formatDate = (date: string) => {
        const d = new Date(date)
        const now = new Date()
        const diff = now.getTime() - d.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))

        if (hours < 1) return 'Just now'
        if (hours < 24) return `${hours}h ago`
        if (hours < 48) return 'Yesterday'
        return d.toLocaleDateString()
    }

    return (
        <main className={styles.main}>
            <div className={styles.topicHeader}>
                <Link href="/forums" className={styles.backLink}>
                    <i className="fa fa-arrow-left"></i> Back to Forums
                </Link>
                {isLoggedIn && (
                    <button className={styles.newTopicBtn} onClick={() => setShowModal(true)}>
                        <i className="fa fa-plus"></i> New Topic
                    </button>
                )}
            </div>

            <div className={styles.header} style={{ background: `linear-gradient(135deg, white 0%, ${category.color}15 100%)` }}>
                <h2 style={{ background: `linear-gradient(to right, ${category.color}, ${category.color}99)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                    <i className={`fa ${category.icon}`}></i> {category.name}
                </h2>
                <p>{category.description}</p>
            </div>

            <div className={styles.topicList}>
                {topics.length === 0 ? (
                    <div className={styles.emptyState}>
                        <i className="fa fa-message"></i>
                        <p>No topics yet. Be the first to start a discussion!</p>
                    </div>
                ) : (
                    topics.map((topic) => (
                        <Link
                            key={topic.id}
                            href={`/forums/topic/${topic.id}`}
                            className={styles.topicCard}
                        >
                            <div className={styles.topicAvatar}>
                                {topic.authorMilitaryId?.slice(-2).toUpperCase() || 'AN'}
                            </div>
                            <div className={styles.topicContent}>
                                <div className={styles.topicTitle}>
                                    {topic.isPinned && <span className={styles.pinnedBadge}>Pinned</span>}
                                    {topic.title}
                                </div>
                                <div className={styles.topicMeta}>
                                    <span>by {topic.authorName}</span>
                                    <span>•</span>
                                    <span>{formatDate(topic.lastActivity || topic.createdAt)}</span>
                                </div>
                            </div>
                            <div className={styles.topicStats}>
                                <span><i className="fa fa-reply"></i> {topic.replyCount}</span>
                                <span><i className="fa fa-eye"></i> {topic.viewCount}</span>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* New Topic Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Create New Topic</h3>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {error && <div className={styles.error}>{error}</div>}

                            <div className={styles.formGroup}>
                                <label htmlFor="title">Topic Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder="What's on your mind?"
                                    maxLength={200}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="content">Content</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    placeholder="Share your thoughts, questions, or ideas..."
                                    required
                                ></textarea>
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? 'Posting...' : 'Post Topic'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
