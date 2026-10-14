'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './topic.module.css'
import { initials } from '@/lib/utils'
import { createForumReply, deleteForumPost, getMuteSettings, updateMuteSettings } from '@/actions/forum'
import { useT, useLang } from '@/i18n/client'
import { localeOf } from '@/i18n/core'

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

interface UserCardData {
    id: string
    name: string
    militaryId: string
    postsCount: number
}

interface TopicClientProps {
    topic: Topic
    isLoggedIn: boolean
    userId?: string
    userRole?: string
}

export default function TopicClient({ topic, isLoggedIn, userId, userRole }: TopicClientProps) {
    const router = useRouter()
    const t = useT()
    const lang = useLang()
    const [replyContent, setReplyContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showReplyForm, setShowReplyForm] = useState(false)
    const [replyingTo, setReplyingTo] = useState<Reply | null>(null)
    const [showMuteSettings, setShowMuteSettings] = useState(false)
    const [highlightedId, setHighlightedId] = useState<string | null>(null)
    const [userCard, setUserCard] = useState<UserCardData | null>(null)
    const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 })
    const [muteSettings, setMuteSettings] = useState<MuteSettings>({
        muteTopicReplies: false,
        muteThreadReplies: false,
        muteQuoteReplies: false
    })
    const replyRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isLoggedIn) {
            getMuteSettings(topic.id).then(settings => {
                if (settings) setMuteSettings(settings as MuteSettings)
            })
        }
    }, [isLoggedIn, topic.id])

    // Close card when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
                setUserCard(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const showUserCard = (e: React.MouseEvent | React.KeyboardEvent, authorId: string, authorName: string, authorMilitaryId: string) => {
        e.stopPropagation()

        // Count posts by this user in this topic
        const postsCount = topic.replies.filter(r => r.authorId === authorId).length + (topic.authorId === authorId ? 1 : 0)

        const rect = (e.target as HTMLElement).getBoundingClientRect()
        setCardPosition({ x: rect.left, y: rect.bottom + 8 })
        setUserCard({
            id: authorId,
            name: authorName,
            militaryId: authorMilitaryId,
            postsCount
        })
    }

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

        const result = await createForumReply(topic.id, formData).catch(() => ({ error: 'Something went wrong. Please try again.' }))

        if (result.error) {
            setError(t(result.error))
        } else {
            setReplyContent('')
            setReplyingTo(null)
            setShowReplyForm(false)
            router.refresh()
        }
        setLoading(false)
    }

    const handleDelete = async (postId: string) => {
        if (!confirm(t('Are you sure you want to delete this?'))) return

        const result = await deleteForumPost(postId)
        if (result.error) {
            alert(t(result.error))
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
        return new Date(String(date).replace(' ', 'T')).toLocaleString(localeOf(lang), {
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

    const openReplyTo = (reply: Reply) => {
        setReplyingTo(reply)
        setShowReplyForm(true)
    }

    const isAnnouncement = topic.categoryId === 'cat_announcements'

    return (
        <main className={styles.main}>
            {/* User Profile Card Popup */}
            {userCard && (
                <div
                    ref={cardRef}
                    className={styles.userCard}
                    style={{ left: cardPosition.x, top: cardPosition.y }}
                >
                    <div className={styles.userCardAvatar} aria-hidden="true">
                        {initials(userCard.name)}
                    </div>
                    <div className={styles.userCardInfo}>
                        <div className={styles.userCardName}>{userCard.name}</div>
                        <div className={styles.userCardMeta}>
                            <span><i className="fa fa-id-card" aria-hidden="true"></i> {userCard.militaryId || '—'}</span>
                        </div>
                        <div className={styles.userCardStats}>
                            <span><i className="fa fa-comments" aria-hidden="true"></i> {t('{n} posts in this topic', { n: userCard.postsCount })}</span>
                        </div>
                    </div>
                    <button type="button" className={styles.userCardClose} onClick={() => setUserCard(null)} aria-label={t('Close')}>
                        <i className="fa fa-times" aria-hidden="true"></i>
                    </button>
                </div>
            )}

            {/* Back Link */}
            <Link href={`/forums/${topic.categoryId}`} className={styles.backLink}>
                <i className="fa fa-arrow-left" aria-hidden="true"></i> {t('Back to Topics')}
            </Link>

            {/* Post Card - Centered */}
            <article className={styles.postCard}>
                <header className={styles.postHeader}>
                    <div
                        className={styles.authorInfo}
                        onClick={(e) => showUserCard(e, topic.authorId, topic.authorName, topic.authorMilitaryId)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showUserCard(e, topic.authorId, topic.authorName, topic.authorMilitaryId) } }}
                    >
                        <div className={styles.authorAvatar} aria-hidden="true">
                            {initials(topic.authorName, 'OP')}
                        </div>
                        <div>
                            <span className={styles.authorName}>{topic.authorName}</span>
                            <span className={styles.postDate}>{formatDate(topic.createdAt)}</span>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        {isLoggedIn && (
                            <button
                                className={styles.iconBtn}
                                type="button"
                                onClick={() => setShowMuteSettings(!showMuteSettings)}
                                title={t('Notification settings')}
                                aria-label={t('Notification settings')}
                                aria-expanded={showMuteSettings}
                            >
                                <i className={`fa ${showMuteSettings ? 'fa-bell-slash' : 'fa-bell'}`} aria-hidden="true"></i>
                            </button>
                        )}
                        {canDelete(topic.authorId) && (
                            <button
                                type="button"
                                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                                onClick={() => handleDelete(topic.id)}
                                aria-label={t('Delete topic')}
                                title={t('Delete topic')}
                            >
                                <i className="fa fa-trash" aria-hidden="true"></i>
                            </button>
                        )}
                    </div>
                </header>

                {/* Mute Settings */}
                {showMuteSettings && (
                    <div className={styles.mutePanel}>
                        <label><input type="checkbox" checked={muteSettings.muteTopicReplies} onChange={() => handleMuteToggle('muteTopicReplies')} /> {t('Mute topic replies')}</label>
                        <label><input type="checkbox" checked={muteSettings.muteThreadReplies} onChange={() => handleMuteToggle('muteThreadReplies')} /> {t('Mute thread replies')}</label>
                        <label><input type="checkbox" checked={muteSettings.muteQuoteReplies} onChange={() => handleMuteToggle('muteQuoteReplies')} /> {t('Mute quote replies')}</label>
                    </div>
                )}

                <h1 className={styles.postTitle}>
                    {topic.title}
                    {isAnnouncement && (
                        <span className={styles.announcementBadge}>
                            <i className="fa fa-bullhorn" aria-hidden="true"></i> {t('Announcement')}
                        </span>
                    )}
                </h1>

                <div className={styles.postBody}>
                    {topic.content}
                </div>

                <footer className={styles.postFooter}>
                    <div className={styles.postStats}>
                        <span><i className="fa fa-comments" aria-hidden="true"></i> {t('{n} replies', { n: topic.replies.length })}</span>
                    </div>
                    {isLoggedIn && (
                        <button
                            type="button"
                            className={styles.replyBtn}
                            onClick={() => { setReplyingTo(null); setShowReplyForm(!showReplyForm); }}
                        >
                            <i className="fa fa-reply" aria-hidden="true"></i> {t('Reply')}
                        </button>
                    )}
                </footer>
            </article>

            {/* Reply Form (below post card) */}
            {showReplyForm && isLoggedIn && (
                <div className={styles.replyFormWrapper}>
                    {replyingTo && (
                        <div className={styles.replyingToBar}>
                            <span>
                                <i className="fa fa-quote-left" aria-hidden="true"></i> {t('Replying to')} <strong>{replyingTo.authorName}</strong>
                            </span>
                            <button type="button" onClick={() => setReplyingTo(null)} aria-label={t('Stop replying to {name}', { name: replyingTo.authorName })}>
                                <i className="fa fa-times" aria-hidden="true"></i>
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleReply} className={styles.replyForm}>
                        {error && <div className={styles.error} role="alert">{error}</div>}
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={replyingTo ? t('Reply to {name}...', { name: replyingTo.authorName }) : t('Write your reply...')}
                            aria-label={t('Your reply')}
                            autoFocus
                            required
                        />
                        <div className={styles.formActions}>
                            <button type="button" className={styles.cancelBtn} onClick={() => setShowReplyForm(false)}>
                                {t('Cancel')}
                            </button>
                            <button type="submit" className={styles.submitBtn} disabled={loading || !replyContent.trim()}>
                                {loading ? <><i className="fa fa-spinner fa-spin" aria-hidden="true"></i> {t('Sending...')}</> : <><i className="fa fa-paper-plane" aria-hidden="true"></i> {t('Send Reply')}</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Replies Section */}
            {topic.replies.length > 0 && (
                <section className={styles.repliesSection}>
                    <h3 className={styles.repliesTitle}>
                        <i className="fa fa-comments" aria-hidden="true"></i> {topic.replies.length === 1 ? t('1 reply') : t('{n} replies', { n: topic.replies.length })}
                    </h3>

                    <div className={styles.repliesList}>
                        {topic.replies.map((reply, index) => {
                            const quotedReply = getQuotedReply(reply.replyToId)
                            const isOP = reply.authorId === topic.authorId

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
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToReply(quotedReply.id) } }}
                                        >
                                            <i className="fa fa-quote-left" aria-hidden="true"></i>
                                            <span className={styles.quotedAuthor}>{reply.replyToAuthorName || quotedReply.authorName}:</span>
                                            <span className={styles.quotedText}>{quotedReply.content.slice(0, 80)}...</span>
                                        </div>
                                    )}

                                    <div className={styles.replyHeader}>
                                        <div
                                            className={styles.replyAuthorInfo}
                                            onClick={(e) => showUserCard(e, reply.authorId, reply.authorName, reply.authorMilitaryId)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showUserCard(e, reply.authorId, reply.authorName, reply.authorMilitaryId) } }}
                                        >
                                            <div className={styles.replyAvatar} aria-hidden="true">
                                                {initials(reply.authorName)}
                                            </div>
                                            <div>
                                                <span className={styles.replyAuthorName}>
                                                    {reply.authorName}
                                                    {isOP && <span className={styles.opBadge} title={t('Topic author')}>{t('Author')}</span>}
                                                </span>
                                                <span className={styles.replyDate}>{formatDate(reply.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className={styles.replyActions}>
                                            <span className={styles.replyNumber}>#{index + 1}</span>
                                            {isLoggedIn && (
                                                <button type="button" className={styles.quoteBtn} onClick={() => openReplyTo(reply)} aria-label={t('Reply to {name}', { name: reply.authorName })} title={t('Reply')}>
                                                    <i className="fa fa-reply" aria-hidden="true"></i>
                                                </button>
                                            )}
                                            {canDelete(reply.authorId) && (
                                                <button type="button" className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(reply.id)} aria-label={t('Delete reply')} title={t('Delete reply')}>
                                                    <i className="fa fa-trash" aria-hidden="true"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.replyBody}>
                                        {reply.content}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Login Prompt */}
            {!isLoggedIn && (
                <div className={styles.loginPrompt}>
                    <i className="fa fa-lock" aria-hidden="true"></i>
                    <span><Link href="/login">{t('Log In')}</Link> {t('to join the discussion')}</span>
                </div>
            )}
        </main>
    )
}
