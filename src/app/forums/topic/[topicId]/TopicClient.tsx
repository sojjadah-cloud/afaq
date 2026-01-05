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

    const isOwner = (authorId: string) => authorId === topic.authorId
    const isAnnouncement = topic.categoryId === 'cat_announcements'

    return (
        <main className={styles.main}>
            {/* Header */}
            <div className={styles.topicHeader}>
                <Link href={`/forums/${topic.categoryId}`} className={styles.backLink}>
                    <i className="fa fa-arrow-left"></i>
                </Link>
                <div className={styles.headerContent}>
                    <h1>{topic.title}</h1>
                    {isAnnouncement && userRole === 'ADMIN' && (
                        <span className={styles.announcementBadge}>
                            <i className="fa fa-bullhorn"></i> Announcement
                        </span>
                    )}
                </div>
                <div className={styles.headerActions}>
                    {isLoggedIn && (
                        <button
                            className={styles.iconBtn}
                            onClick={() => setShowMuteSettings(!showMuteSettings)}
                            title="Notification Settings"
                        >
                            <i className={`fa ${muteSettings.muteTopicReplies && muteSettings.muteThreadReplies && muteSettings.muteQuoteReplies ? 'fa-bell-slash' : 'fa-bell'}`}></i>
                        </button>
                    )}
                </div>
            </div>

            {/* Mute Settings Panel */}
            {showMuteSettings && (
                <div className={styles.mutePanel}>
                    <div className={styles.mutePanelHeader}>
                        <i className="fa fa-bell-slash"></i> Notification Settings
                    </div>
                    <label className={styles.muteOption}>
                        <input
                            type="checkbox"
                            checked={muteSettings.muteTopicReplies}
                            onChange={() => handleMuteToggle('muteTopicReplies')}
                        />
                        <span>Mute replies to my topics</span>
                    </label>
                    <label className={styles.muteOption}>
                        <input
                            type="checkbox"
                            checked={muteSettings.muteThreadReplies}
                            onChange={() => handleMuteToggle('muteThreadReplies')}
                        />
                        <span>Mute thread notifications</span>
                    </label>
                    <label className={styles.muteOption}>
                        <input
                            type="checkbox"
                            checked={muteSettings.muteQuoteReplies}
                            onChange={() => handleMuteToggle('muteQuoteReplies')}
                        />
                        <span>Mute quote notifications</span>
                    </label>
                </div>
            )}

            {/* Chat Container */}
            <div className={styles.chatContainer}>
                {/* Original Post - Always Left (Owner) */}
                <div className={`${styles.messageWrapper} ${styles.messageLeft}`}>
                    <div className={styles.avatarCol}>
                        <div className={styles.avatarLarge}>
                            {topic.authorMilitaryId?.slice(-2).toUpperCase() || 'OP'}
                        </div>
                        <span className={styles.ownerBadge}>OP</span>
                    </div>
                    <div className={styles.messageCard}>
                        <div className={styles.messageHeader}>
                            <span className={styles.authorName}>{topic.authorName}</span>
                            <span className={styles.messageTime}>{formatDate(topic.createdAt)}</span>
                            {canDelete(topic.authorId) && (
                                <button className={styles.deleteBtn} onClick={() => handleDelete(topic.id)}>
                                    <i className="fa fa-trash"></i>
                                </button>
                            )}
                        </div>
                        <div className={styles.messageContent}>
                            {topic.content}
                        </div>
                        {isAnnouncement && userRole === 'ADMIN' && (
                            <div className={styles.everyoneTag}>
                                <i className="fa fa-at"></i> everyone
                            </div>
                        )}
                    </div>
                </div>

                {/* Replies */}
                {topic.replies.map((reply) => {
                    const quotedReply = getQuotedReply(reply.replyToId)
                    const isOwnerReply = isOwner(reply.authorId)

                    return (
                        <div
                            key={reply.id}
                            ref={el => { replyRefs.current[reply.id] = el }}
                            className={`${styles.messageWrapper} ${isOwnerReply ? styles.messageLeft : styles.messageRight} ${highlightedId === reply.id ? styles.highlighted : ''}`}
                        >
                            {isOwnerReply && (
                                <div className={styles.avatarCol}>
                                    <div className={styles.avatarSmall}>
                                        {reply.authorMilitaryId?.slice(-2).toUpperCase() || 'OP'}
                                    </div>
                                </div>
                            )}
                            <div className={`${styles.messageCard} ${isOwnerReply ? styles.ownerCard : styles.otherCard}`}>
                                {/* Quoted Reply */}
                                {quotedReply && (
                                    <div
                                        className={styles.quotedMessage}
                                        onClick={() => scrollToReply(quotedReply.id)}
                                    >
                                        <i className="fa fa-reply"></i>
                                        <span className={styles.quotedAuthor}>{reply.replyToAuthorName || quotedReply.authorName}</span>
                                        <span className={styles.quotedText}>{quotedReply.content.slice(0, 60)}...</span>
                                    </div>
                                )}
                                <div className={styles.messageHeader}>
                                    <span className={styles.authorName}>{reply.authorName}</span>
                                    <span className={styles.messageTime}>{formatDate(reply.createdAt)}</span>
                                </div>
                                <div className={styles.messageContent}>
                                    {reply.content}
                                </div>
                                <div className={styles.messageActions}>
                                    {isLoggedIn && (
                                        <button
                                            className={styles.replyBtn}
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
                            {!isOwnerReply && (
                                <div className={styles.avatarCol}>
                                    <div className={styles.avatarSmall}>
                                        {reply.authorMilitaryId?.slice(-2).toUpperCase() || 'AN'}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Reply Form */}
            {isLoggedIn ? (
                <div className={styles.replyFormContainer}>
                    {replyingTo && (
                        <div className={styles.replyingToBar}>
                            <div className={styles.replyingToContent}>
                                <i className="fa fa-reply"></i>
                                <span>Replying to <strong>{replyingTo.authorName}</strong></span>
                                <span className={styles.replyingToPreview}>{replyingTo.content.slice(0, 40)}...</span>
                            </div>
                            <button onClick={() => setReplyingTo(null)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleReply} className={styles.replyForm}>
                        {error && <div className={styles.error}>{error}</div>}
                        <div className={styles.inputRow}>
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={replyingTo ? `Reply to ${replyingTo.authorName}...` : "Write your message..."}
                                required
                                rows={2}
                            />
                            <button type="submit" disabled={loading || !replyContent.trim()}>
                                {loading ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-paper-plane"></i>}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className={styles.loginPrompt}>
                    <Link href="/login">Log in</Link> to join the conversation
                </div>
            )}
        </main>
    )
}
