'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './topic.module.css'
import { createForumReply, deleteForumPost, getMuteSettings, updateMuteSettings } from '@/actions/forum'

interface Reply {
    id: string
    content: string
    authorId: string
    authorName: string
    authorMilitaryId: string
    createdAt: string
    replyToId?: string
    replyToAuthorName?: string
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

interface MuteSettings {
    muteTopicReplies: boolean
    muteThreadReplies: boolean
    muteQuoteReplies: boolean
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
    const [replyingTo, setReplyingTo] = useState<Reply | null>(null)
    const [showMuteSettings, setShowMuteSettings] = useState(false)
    const [highlightedId, setHighlightedId] = useState<string | null>(null)
    const [muteSettings, setMuteSettings] = useState<MuteSettings>({
        muteTopicReplies: false,
        muteThreadReplies: false,
        muteQuoteReplies: false
    })
    const replyRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

    useEffect(() => {
        if (isLoggedIn) {
            getMuteSettings(topic.id).then(settings => {
                if (settings) setMuteSettings(settings)
            })
        }
    }, [isLoggedIn, topic.id])

    const scrollToReply = (replyId: string) => {
        const element = replyRefs.current[replyId]
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            setHighlightedId(replyId)
            setTimeout(() => setHighlightedId(null), 2000)
        }
    }

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!replyContent.trim()) return

        setLoading(true)
        setError('')

        const formData = new FormData()
        formData.append('content', replyContent)
        if (replyingTo) {
            formData.append('replyToId', replyingTo.id)
        }

        const result = await createForumReply(topic.id, formData)

        if (result.error) {
            setError(result.error)
        } else {
            setReplyContent('')
            setReplyingTo(null)
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

    const handleMuteToggle = async (setting: keyof MuteSettings) => {
        const newValue = !muteSettings[setting]
        setMuteSettings(prev => ({ ...prev, [setting]: newValue }))
        await updateMuteSettings(topic.id, setting, newValue)
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

    const getQuotedReply = (replyToId: string | undefined) => {
        if (!replyToId) return null
        return topic.replies.find(r => r.id === replyToId)
    }

    const isAnnouncement = topic.categoryId === 'cat_announcements'

    return (
        <main className={styles.main}>
            {/* Back Link */}
            <Link href={`/forums/${topic.categoryId}`} className={styles.backLink}>
                <i className="fa fa-arrow-left"></i> Back to Topics
            </Link>

            {/* Original Post Card - Centered */}
            <div className={styles.postCard}>
                <div className={styles.postHeader}>
                    <div className={styles.postAvatar}>
                        {topic.authorMilitaryId?.slice(-2).toUpperCase() || 'OP'}
                    </div>
                    <div className={styles.postAuthorInfo}>
                        <span className={styles.postAuthorName}>{topic.authorName}</span>
                        <span className={styles.postDate}>{formatDate(topic.createdAt)}</span>
                    </div>
                    <div className={styles.postActions}>
                        {isLoggedIn && (
                            <button
                                className={styles.muteBtn}
                                onClick={() => setShowMuteSettings(!showMuteSettings)}
                                title="Notification Settings"
                            >
                                <i className={`fa ${showMuteSettings ? 'fa-bell-slash' : 'fa-bell'}`}></i>
                            </button>
                        )}
                        {canDelete(topic.authorId) && (
                            <button className={styles.deleteBtn} onClick={() => handleDelete(topic.id)}>
                                <i className="fa fa-trash"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* Mute Settings */}
                {showMuteSettings && (
                    <div className={styles.mutePanel}>
                        <label className={styles.muteOption}>
                            <input type="checkbox" checked={muteSettings.muteTopicReplies} onChange={() => handleMuteToggle('muteTopicReplies')} />
                            Mute topic replies
                        </label>
                        <label className={styles.muteOption}>
                            <input type="checkbox" checked={muteSettings.muteThreadReplies} onChange={() => handleMuteToggle('muteThreadReplies')} />
                            Mute thread replies
                        </label>
                        <label className={styles.muteOption}>
                            <input type="checkbox" checked={muteSettings.muteQuoteReplies} onChange={() => handleMuteToggle('muteQuoteReplies')} />
                            Mute quote replies
                        </label>
                    </div>
                )}

                <h1 className={styles.postTitle}>{topic.title}</h1>

                {isAnnouncement && userRole === 'ADMIN' && (
                    <div className={styles.everyoneTag}>
                        <i className="fa fa-at"></i> everyone
                    </div>
                )}

                <div className={styles.postContent}>
                    {topic.content}
                </div>
            </div>

            {/* Replies Section */}
            <div className={styles.repliesSection}>
                <h3 className={styles.repliesTitle}>
                    <i className="fa fa-comments"></i> {topic.replies.length} {topic.replies.length === 1 ? 'Reply' : 'Replies'}
                </h3>

                {topic.replies.length === 0 ? (
                    <div className={styles.noReplies}>
                        <p>No replies yet. Be the first to reply!</p>
                    </div>
                ) : (
                    <div className={styles.repliesList}>
                        {topic.replies.map((reply) => {
                            const quotedReply = getQuotedReply(reply.replyToId)
                            return (
                                <div
                                    key={reply.id}
                                    ref={el => { replyRefs.current[reply.id] = el }}
                                    className={`${styles.replyCard} ${highlightedId === reply.id ? styles.highlighted : ''}`}
                                >
                                    {/* Quoted Reply */}
                                    {quotedReply && (
                                        <div
                                            className={styles.quotedReply}
                                            onClick={() => scrollToReply(quotedReply.id)}
                                        >
                                            <i className="fa fa-quote-left"></i>
                                            <span className={styles.quotedAuthor}>{reply.replyToAuthorName || quotedReply.authorName}:</span>
                                            <span className={styles.quotedText}>{quotedReply.content.slice(0, 80)}...</span>
                                        </div>
                                    )}

                                    <div className={styles.replyHeader}>
                                        <div className={styles.replyAvatar}>
                                            {reply.authorMilitaryId?.slice(-2).toUpperCase() || 'AN'}
                                        </div>
                                        <div className={styles.replyAuthorInfo}>
                                            <span className={styles.replyAuthorName}>
                                                {reply.authorName}
                                                {reply.authorId === topic.authorId && (
                                                    <span className={styles.opBadge}>OP</span>
                                                )}
                                            </span>
                                            <span className={styles.replyDate}>{formatDate(reply.createdAt)}</span>
                                        </div>
                                        <div className={styles.replyActions}>
                                            {isLoggedIn && (
                                                <button
                                                    className={styles.quoteBtn}
                                                    onClick={() => setReplyingTo(reply)}
                                                >
                                                    <i className="fa fa-reply"></i> Reply
                                                </button>
                                            )}
                                            {canDelete(reply.authorId) && (
                                                <button className={styles.deleteBtn} onClick={() => handleDelete(reply.id)}>
                                                    <i className="fa fa-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.replyContent}>
                                        {reply.content}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Reply Form */}
                {isLoggedIn ? (
                    <div className={styles.replyFormWrapper}>
                        {replyingTo && (
                            <div className={styles.replyingToBar}>
                                <span>
                                    <i className="fa fa-reply"></i> Replying to <strong>{replyingTo.authorName}</strong>
                                </span>
                                <button onClick={() => setReplyingTo(null)}>
                                    <i className="fa fa-times"></i>
                                </button>
                            </div>
                        )}
                        <form onSubmit={handleReply} className={styles.replyForm}>
                            {error && <div className={styles.error}>{error}</div>}
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={replyingTo ? `Reply to ${replyingTo.authorName}...` : "Write your reply..."}
                                required
                            />
                            <button type="submit" disabled={loading || !replyContent.trim()}>
                                {loading ? <><i className="fa fa-spinner fa-spin"></i> Posting...</> : <><i className="fa fa-paper-plane"></i> Post Reply</>}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className={styles.loginPrompt}>
                        <Link href="/login">Log in</Link> to reply to this topic
                    </div>
                )}
            </div>
        </main>
    )
}
