'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './topic.module.css'
import { createForumReply, deleteForumPost } from '@/actions/forum'

interface Reply {
    id: string
    content: string
    authorName: string
    authorMilitaryId: string
    createdAt: string
}

interface Topic {
    id: string
    title: string
    content: string
    categoryId: string
    authorId: string
    authorName: string
    authorMilitaryId: string
    createdAt: string
    replies: Reply[]
}

interface TopicClientProps {
    topic: Topic
    isLoggedIn: boolean
    userId?: string
    userRole?: string
}

export default function TopicClient({ topic, isLoggedIn, userId, userRole }: TopicClientProps) {
    const router = useRouter()
    const [replyContent, setReplyContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!replyContent.trim()) return

        setLoading(true)
        setError('')

        const formData = new FormData()
        formData.append('content', replyContent)

        const result = await createForumReply(topic.id, formData)

        if (result.error) {
            setError(result.error)
        } else {
            setReplyContent('')
            router.refresh()
        }
        setLoading(false)
    }

    const handleDelete = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this?')) return

        const result = await deleteForumPost(postId)
        if (result.error) {
            alert(result.error)
        } else {
            if (postId === topic.id) {
                router.push(`/forums/${topic.categoryId}`)
            } else {
                router.refresh()
            }
        }
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const canDelete = (authorId: string) => {
        return userId === authorId || userRole === 'ADMIN'
    }

    return (
        <main className={styles.main}>
            <Link href={`/forums/${topic.categoryId}`} className={styles.backLink}>
                <i className="fa fa-arrow-left"></i> Back to Topics
            </Link>

            {/* Original Post */}
            <div className={styles.topicPost}>
                <div className={styles.postHeader}>
                    <h1>{topic.title}</h1>
                    {canDelete(topic.authorId) && (
                        <button className={styles.deleteBtn} onClick={() => handleDelete(topic.id)}>
                            <i className="fa fa-trash"></i>
                        </button>
                    )}
                </div>
                <div className={styles.postMeta}>
                    <div className={styles.avatar}>
                        {topic.authorMilitaryId?.slice(-2).toUpperCase() || 'AN'}
                    </div>
                    <div>
                        <div className={styles.authorName}>{topic.authorName}</div>
                        <div className={styles.postDate}>{formatDate(topic.createdAt)}</div>
                    </div>
                </div>
                <div className={styles.postContent}>
                    {topic.content}
                </div>
            </div>

            {/* Replies */}
            <div className={styles.repliesSection}>
                <h3><i className="fa fa-comments"></i> {topic.replies.length} Replies</h3>

                {topic.replies.map((reply) => (
                    <div key={reply.id} className={styles.replyCard}>
                        <div className={styles.replyHeader}>
                            <div className={styles.postMeta}>
                                <div className={styles.avatarSmall}>
                                    {reply.authorMilitaryId?.slice(-2).toUpperCase() || 'AN'}
                                </div>
                                <div>
                                    <div className={styles.authorName}>{reply.authorName}</div>
                                    <div className={styles.postDate}>{formatDate(reply.createdAt)}</div>
                                </div>
                            </div>
                            {canDelete(reply.id.replace('reply_', '')) && userRole === 'ADMIN' && (
                                <button className={styles.deleteBtn} onClick={() => handleDelete(reply.id)}>
                                    <i className="fa fa-trash"></i>
                                </button>
                            )}
                        </div>
                        <div className={styles.replyContent}>
                            {reply.content}
                        </div>
                    </div>
                ))}

                {/* Reply Form */}
                {isLoggedIn ? (
                    <form onSubmit={handleReply} className={styles.replyForm}>
                        {error && <div className={styles.error}>{error}</div>}
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write your reply..."
                            required
                        />
                        <button type="submit" disabled={loading || !replyContent.trim()}>
                            {loading ? 'Posting...' : 'Post Reply'}
                        </button>
                    </form>
                ) : (
                    <div className={styles.loginPrompt}>
                        <Link href="/login">Log in</Link> to reply to this topic
                    </div>
                )}
            </div>
        </main>
    )
}
