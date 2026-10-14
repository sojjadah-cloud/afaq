'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/actions/notifications'
import styles from './NotificationBell.module.css'
import { useT, useFormatDay } from '@/i18n/client'
import { notificationMessage, notificationTitle } from '@/i18n/notifications'

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link: string
    isRead: boolean
    createdAt: string
}

export default function NotificationBell() {
    const router = useRouter()
    const t = useT()
    const formatDay = useFormatDay()
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Fetch unread count on mount
    useEffect(() => {
        fetchUnreadCount()
        const interval = setInterval(fetchUnreadCount, 30000) // Poll every 30s
        return () => clearInterval(interval)
    }, [])

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchUnreadCount = async () => {
        const count = await getUnreadCount()
        setUnreadCount(count)
    }

    const fetchNotifications = async () => {
        setLoading(true)
        const notifs = await getNotifications()
        setNotifications(notifs as Notification[])
        setLoading(false)
    }

    const handleOpen = () => {
        setIsOpen(!isOpen)
        if (!isOpen) {
            fetchNotifications()
        }
    }

    const handleNotificationClick = async (notif: Notification) => {
        if (!notif.isRead) {
            await markAsRead(notif.id)
            setUnreadCount(prev => Math.max(0, prev - 1))
        }
        setIsOpen(false)
        if (notif.link) {
            router.push(notif.link)
        }
    }

    const handleMarkAllRead = async () => {
        await markAllAsRead()
        setUnreadCount(0)
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    }

    const getTypeIcon = (type: string) => {
        const t = (type || '').toLowerCase()
        if (t === 'announcement') return 'fa-bullhorn'
        if (t.startsWith('project')) return 'fa-lightbulb'
        if (t.startsWith('booking')) return 'fa-calendar-check'
        if (t.startsWith('forum')) return 'fa-comments'
        if (t.startsWith('event')) return 'fa-calendar'
        if (t.startsWith('research')) return 'fa-scroll'
        return 'fa-bell'
    }

    const formatTime = (date: string) => {
        const d = new Date(date)
        const now = new Date()
        const diff = now.getTime() - d.getTime()
        const mins = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (mins < 1) return t('Just now')
        if (mins < 60) return t('{n} min ago', { n: mins })
        if (hours < 24) return t('{n} h ago', { n: hours })
        if (days < 7) return t('{n} d ago', { n: days })
        return formatDay(date)
    }

    return (
        <div className={styles.wrapper} ref={dropdownRef}>
            <button
                type="button"
                className={styles.bellBtn}
                onClick={handleOpen}
                aria-label={unreadCount > 0 ? t('Notifications ({n} unread)', { n: unreadCount }) : t('Notifications')}
                aria-expanded={isOpen}
            >
                <i className="fa fa-bell" aria-hidden="true"></i>
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                        <h4>{t('Notifications')}</h4>
                        {unreadCount > 0 && (
                            <button className={styles.markAllBtn} onClick={handleMarkAllRead}>
                                {t('Mark all read')}
                            </button>
                        )}
                    </div>

                    <div className={styles.notificationList}>
                        {loading ? (
                            <div className={styles.loading}>
                                <i className="fa fa-spinner fa-spin"></i>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className={styles.empty}>
                                <i className="fa fa-bell-slash"></i>
                                <p>{t('No notifications yet')}</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <button
                                    type="button"
                                    key={notif.id}
                                    className={`${styles.notificationItem} ${!notif.isRead ? styles.unread : ''}`}
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    <div className={styles.notifIcon}>
                                        <i className={`fa ${getTypeIcon(notif.type)}`}></i>
                                    </div>
                                    <div className={styles.notifContent}>
                                        <div className={styles.notifTitle}>{notificationTitle(notif.title, t)}</div>
                                        {notif.message && (
                                            <div className={styles.notifMessage}>{notificationMessage(notif.message, t)}</div>
                                        )}
                                        <div className={styles.notifTime}>{formatTime(notif.createdAt)}</div>
                                    </div>
                                    {!notif.isRead && <div className={styles.unreadDot} aria-label={t('Unread')}></div>}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
