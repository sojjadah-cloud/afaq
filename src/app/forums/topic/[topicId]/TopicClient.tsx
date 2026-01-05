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

    const formatShortDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
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

    // Render a post (either the topic or a reply)
    const renderPost = (
        post: { id: string; content: string; authorId: string; authorName: string; authorMilitaryId: string; createdAt: string; replyToId?: string; replyToAuthorName?: string },
        index: number,
        isOriginalPost: boolean = false,
        title?: string
    ) => {
        const quotedReply = !isOriginalPost ? getQuotedReply(post.replyToId) : null
        const isOP = post.authorId === topic.authorId

        return (
            <article
                key={post.id}
                ref={el => { if (!isOriginalPost) replyRefs.current[post.id] = el }}
                className={`${styles.post} ${highlightedId === post.id ? styles.highlighted : ''} ${isOriginalPost ? styles.originalPost : ''}`}
            >
                {/* Left - Author Info */}
                <aside className={styles.authorSidebar}>
                    <div className={styles.authorAvatar}>
                        {post.authorMilitaryId?.slice(-2).toUpperCase() || 'AN'}
                    </div>
                    <div className={styles.authorName}>{post.authorName}</div>
                    {isOP && <span className={styles.opBadge}>OP</span>}
                    {isOriginalPost && userRole === 'ADMIN' && (
                        <span className={styles.adminBadge}>Admin</span>
                    )}
                </aside>

                {/* Right - Content */}
                <div className={styles.postContent}>
                    {/* Post Header */}
                    <header className={styles.postHeader}>
                        <div className={styles.postMeta}>
                            <span className={styles.postNumber}>#{isOriginalPost ? 1 : index + 2}</span>
                            <time className={styles.postDate}>{formatDate(post.createdAt)}</time>
                        </div>
                        <div className={styles.postActions}>
                            {isLoggedIn && !isOriginalPost && (
                                <button
                                    className={styles.actionBtn}
                                    onClick={() => setReplyingTo(post as Reply)}
                                    title="Quote Reply"
                                >
                                    <i className="fa fa-quote-left"></i>
                                </button>
                            )}
                            {isLoggedIn && isOriginalPost && (
                                <button
                                    className={styles.actionBtn}
                                    onClick={() => setShowMuteSettings(!showMuteSettings)}
                                    title="Notification Settings"
                                >
                                    <i className={`fa ${showMuteSettings ? 'fa-bell-slash' : 'fa-bell'}`}></i>
                                </button>
                            )}
                            {canDelete(post.authorId) && (
                                <button
                                    className={`${styles.actionBtn} ${styles.deleteAction}`}
                                    onClick={() => handleDelete(post.id)}
                                    title="Delete"
                                >
                                    <i className="fa fa-trash"></i>
                                </button>
                            )}
                        </div>
                    </header>

                    {/* Mute Settings (only for original post) */}
                    {isOriginalPost && showMuteSettings && (
                        <div className={styles.mutePanel}>
                            <label><input type="checkbox" checked={muteSettings.muteTopicReplies} onChange={() => handleMuteToggle('muteTopicReplies')} /> Mute topic replies</label>
                            <label><input type="checkbox" checked={muteSettings.muteThreadReplies} onChange={() => handleMuteToggle('muteThreadReplies')} /> Mute thread replies</label>
                            <label><input type="checkbox" checked={muteSettings.muteQuoteReplies} onChange={() => handleMuteToggle('muteQuoteReplies')} /> Mute quote replies</label>
                        </div>
                    )}

                    {/* Title (only for original post) */}
                    {title && (
                        <h1 className={styles.postTitle}>
                            {title}
                            {isAnnouncement && (
                                <span className={styles.announcementTag}>
                                    <i className="fa fa-bullhorn"></i> Announcement
                                </span>
                            )}
                        </h1>
                    )}

                    {/* Quoted Reply */}
                    {quotedReply && (
                        <blockquote
                            className={styles.quotedPost}
                            onClick={() => scrollToReply(quotedReply.id)}
                        >
                            <div className={styles.quotedHeader}>
                                <i className="fa fa-reply"></i>
                                <span>{post.replyToAuthorName || quotedReply.authorName}</span>
                            </div>
                            <p>{quotedReply.content.slice(0, 150)}...</p>
                        </blockquote>
                    )}

                    {/* Post Body */}
                    <div className={styles.postBody}>
                        {post.content}
                    </div>

                    {/* Footer */}
                    {!isOriginalPost && isLoggedIn && (
                        <footer className={styles.postFooter}>
                            <button
                                className={styles.replyLink}
                                onClick={() => setReplyingTo(post as Reply)}
                            >
                                <i className="fa fa-reply"></i> Reply
                            </button>
                        </footer>
                    )}
                </div>
            </article>
        )
    }

    return (
        <main className={styles.main}>
            {/* Topic Header */}
            <div className={styles.topicNav}>
                <Link href={`/forums/${topic.categoryId}`} className={styles.backLink}>
                    <i className="fa fa-arrow-left"></i> Back to Topics
                </Link>
                <div className={styles.topicStats}>
                    <span><i className="fa fa-comments"></i> {topic.replies.length} replies</span>
                    <span><i className="fa fa-clock"></i> {formatShortDate(topic.createdAt)}</span>
                </div>
            </div>

            {/* Posts Container */}
            <div className={styles.postsContainer}>
                {/* Original Post */}
                {renderPost(topic, 0, true, topic.title)}

                {/* Replies */}
                {topic.replies.length > 0 && (
                    <div className={styles.repliesDivider}>
                        <span>{topic.replies.length} {topic.replies.length === 1 ? 'reply' : 'replies'}</span>
                    </div>
                )}

                {topic.replies.map((reply, index) => renderPost(reply, index))}
            </div>

            {/* Reply Form */}
            {isLoggedIn ? (
                <div className={styles.replyFormWrapper}>
                    {replyingTo && (
                        <div className={styles.replyingToBar}>
                            <span>
                                <i className="fa fa-reply"></i> Replying to <strong>{replyingTo.authorName}</strong>:
                                <em>{replyingTo.content.slice(0, 50)}...</em>
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
                            placeholder={replyingTo ? `Reply to ${replyingTo.authorName}...` : "Share your thoughts..."}
                            required
                        />
                        <div className={styles.formActions}>
                            <button type="submit" disabled={loading || !replyContent.trim()}>
                                {loading ? <><i className="fa fa-spinner fa-spin"></i> Posting...</> : <><i className="fa fa-paper-plane"></i> Reply</>}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className={styles.loginPrompt}>
                    <i className="fa fa-lock"></i>
                    <span><Link href="/login">Log in</Link> to join the discussion</span>
                </div>
            )}
        </main>
    )
}
