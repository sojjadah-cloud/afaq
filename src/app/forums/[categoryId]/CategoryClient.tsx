'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../page.module.css'
import { initials } from '@/lib/utils'
import { createForumTopic } from '@/actions/forum'
import { useT, useFormatDay } from '@/i18n/client'

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
    const t = useT()
    const formatDay = useFormatDay()
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.append('categoryId', category.id)

        const result = await createForumTopic(formData).catch(() => ({ error: 'Something went wrong. Please try again.' }))

        if (result.error) {
            setError(t(result.error))
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

        if (hours < 1) return t('Just now')
        if (hours < 24) return t('{n} h ago', { n: hours })
        if (hours < 48) return t('Yesterday')
        return formatDay(date)
    }

    return (
        <main className={styles.main}>
            <div className={styles.topicHeader}>
                <Link href="/forums" className={styles.backLink}>
                    <i className="fa fa-arrow-left" aria-hidden="true"></i> {t('Back to Forums')}
                </Link>
                {isLoggedIn && (
                    <button type="button" className={styles.newTopicBtn} onClick={() => setShowModal(true)}>
                        <i className="fa fa-plus" aria-hidden="true"></i> {t('New Topic')}
                    </button>
                )}
            </div>

            <div className={styles.header} style={{ background: `linear-gradient(135deg, white 0%, ${category.color}15 100%)` }}>
                <h2 style={{ background: `linear-gradient(to right, ${category.color}, ${category.color}99)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                    <i className={`fa ${category.icon}`} aria-hidden="true"></i> {t(category.name)}
                </h2>
                <p>{t(category.description)}</p>
            </div>

            <div className={styles.topicList}>
                {topics.length === 0 ? (
                    <div className={styles.emptyState}>
                        <i className="fa fa-message" aria-hidden="true"></i>
                        <p>{t('No topics yet. Be the first to start a discussion!')}</p>
                    </div>
                ) : (
                    topics.map((topic) => (
                        <Link
                            key={topic.id}
                            href={`/forums/topic/${topic.id}`}
                            className={styles.topicCard}
                        >
                            <div className={styles.topicAvatar} aria-hidden="true">
                                {initials(topic.authorName)}
                            </div>
                            <div className={styles.topicContent}>
                                <div className={styles.topicTitle}>
                                    {topic.isPinned && <span className={styles.pinnedBadge}>{t('Pinned')}</span>}
                                    {topic.title}
                                </div>
                                <div className={styles.topicMeta}>
                                    <span>{t('by {name}', { name: topic.authorName })}</span>
                                    <span>•</span>
                                    <span>{formatDate(topic.lastActivity || topic.createdAt)}</span>
                                </div>
                            </div>
                            <div className={styles.topicStats}>
                                <span title={t('Replies')}><i className="fa fa-reply" aria-hidden="true"></i> {topic.replyCount}</span>
                                <span title={t('Views')}><i className="fa fa-eye" aria-hidden="true"></i> {topic.viewCount}</span>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* New Topic Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} role="dialog" aria-modal="true" aria-labelledby="topic-form-title" onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 id="topic-form-title">{t('Create New Topic')}</h3>
                            <button type="button" className={styles.closeBtn} onClick={() => setShowModal(false)} aria-label={t('Close')}>
                                <i className="fa fa-times" aria-hidden="true"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {error && <div className={styles.error} role="alert">{error}</div>}

                            <div className={styles.formGroup}>
                                <label htmlFor="title">{t('Topic Title')}</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder={t("What's on your mind?")}
                                    maxLength={200}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="content">{t('Content')}</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    placeholder={t('Share your thoughts, questions, or ideas...')}
                                    required
                                ></textarea>
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                                    {t('Cancel')}
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? t('Posting...') : t('Post Topic')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
