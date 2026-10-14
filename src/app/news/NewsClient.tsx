'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'
import { createNews, deleteNews } from '@/actions/news'
import { uploadImage } from '@/actions/upload'
import { useT, useFormatDay } from '@/i18n/client'

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

interface NewsClientProps {
    items: NewsItem[]
    counts: Record<Filter, number>
    active: Filter
    userRole: string | undefined
    isLoggedIn: boolean
}

export default function NewsClient({ items, counts, active, userRole, isLoggedIn }: NewsClientProps) {
    const router = useRouter()
    const t = useT()
    const formatDay = useFormatDay()
    const formatDate = (value: string | null) => (value ? formatDay(value, { day: 'numeric', month: 'long', year: 'numeric' }) : '')
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
                setError(t(uploadResult.error))
                setLoading(false)
                return
            }
            formData.set('imageUrl', uploadResult.url || '')
        }
        formData.delete('image')

        const result = await createNews(formData)
        setLoading(false)
        if (result.error) {
            setError(t(result.error))
        } else {
            setShowModal(false)
            router.refresh()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm(t('Delete this entry?'))) return
        const result = await deleteNews(id)
        if (result.error) alert(t(result.error))
        else router.refresh()
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>{t('News & Achievements')}</h2>
                <p>{t('Latest updates, milestones and wins from the AFAQ Scientific Club.')}</p>
                {canCreate && (
                    <button type="button" className={styles.createBtn} onClick={() => setShowModal(true)}>
                        <i className="fa fa-plus" aria-hidden="true"></i> {t('Add Entry')}
                    </button>
                )}
            </div>

            <nav className={styles.tabs} aria-label={t('Filter')}>
                {TABS.map(tab => (
                    <Link
                        key={tab.key}
                        href={tab.href}
                        className={`${styles.tab} ${active === tab.key ? styles.tabActive : ''}`}
                        aria-current={active === tab.key ? 'page' : undefined}
                    >
                        <i className={`fa-solid ${tab.icon}`} aria-hidden="true"></i> {t(tab.label)}
                        <span className={styles.tabCount}>{counts[tab.key]}</span>
                    </Link>
                ))}
            </nav>

            {items.length === 0 ? (
                <div className={styles.emptyState}>
                    <i className="fa fa-newspaper" aria-hidden="true"></i>
                    <p>{t('No entries yet.')}</p>
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
                                        <i className={`fa-solid ${isAchievement ? 'fa-trophy' : 'fa-bullhorn'}`} aria-hidden="true"></i>
                                        {isAchievement ? t('Achievement') : t('News')}
                                    </span>
                                </div>
                                <div className={styles.newsBody}>
                                    <h3>{item.title}</h3>
                                    <p className={styles.newsSummary}>{item.summary}</p>
                                    <div className={styles.newsMeta}>
                                        {item.eventDate && (
                                            <span><i className="fa-regular fa-calendar" aria-hidden="true"></i> {formatDate(item.eventDate)}</span>
                                        )}
                                        {item.location && (
                                            <span><i className="fa-solid fa-location-dot" aria-hidden="true"></i> {item.location}</span>
                                        )}
                                        {canDelete && (
                                            <button type="button" className={styles.deleteBtn} onClick={() => handleDelete(item.id)} aria-label={t('Delete {name}', { name: item.title })}>
                                                <i className="fa fa-trash" aria-hidden="true"></i>
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
                    <div className={styles.modalContent} role="dialog" aria-modal="true" aria-labelledby="news-form-title" onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 id="news-form-title">{t('Add News / Achievement')}</h3>
                            <button type="button" className={styles.closeBtn} onClick={() => setShowModal(false)} aria-label={t('Close')}>
                                <i className="fa fa-times" aria-hidden="true"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="title">{t('Title')} *</label>
                                <input type="text" id="title" name="title" required />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="type">{t('Type')} *</label>
                                    <select id="type" name="type" required defaultValue={active === 'ACHIEVEMENT' ? 'ACHIEVEMENT' : 'NEWS'}>
                                        <option value="NEWS">{t('News')}</option>
                                        <option value="ACHIEVEMENT">{t('Achievement')}</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="eventDate">{t('Date')}</label>
                                    <input type="date" id="eventDate" name="eventDate" />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="location">{t('Location')}</label>
                                <input type="text" id="location" name="location" placeholder={t('e.g. Main Auditorium, MTC')} />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="summary">{t('Description')} *</label>
                                <textarea id="summary" name="summary" rows={5} placeholder={t('What happened?')} required></textarea>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="image">{t('Image')}</label>
                                <input type="file" id="image" name="image" accept=".png,.jpg,.jpeg,.gif,.webp" />
                            </div>

                            {error && <div className={styles.error} role="alert">{error}</div>}

                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setShowModal(false)} disabled={loading}>{t('Cancel')}</button>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? t('Adding...') : t('Add Entry')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
