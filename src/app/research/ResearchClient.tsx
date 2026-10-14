'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'
import { createResearch } from '@/actions/research'
import { useT } from '@/i18n/client'

interface Research {
    id: string
    title: string
    abstract: string
    authors: string
    category: string
    publicationDate: string | null
    url: string | null
    createdAt: string
}

interface ResearchClientProps {
    initialResearch: Research[]
    userRole: string | undefined
    isLoggedIn: boolean
}

const CATEGORY_META: Record<string, { icon: string }> = {
    Published: { icon: 'fa-check-double' },
    Ongoing: { icon: 'fa-hourglass-half' },
    Thesis: { icon: 'fa-graduation-cap' },
    Conference: { icon: 'fa-people-group' },
    Patent: { icon: 'fa-lightbulb' },
}

export default function ResearchClient({ initialResearch, userRole, isLoggedIn }: ResearchClientProps) {
    const router = useRouter()
    const t = useT()
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const canCreate = isLoggedIn && (userRole === 'STAFF' || userRole === 'ADMIN')

    const categories = ['Published', 'Ongoing', 'Thesis', 'Conference', 'Patent']

    const groups = categories
        .map(cat => ({ category: cat, items: initialResearch.filter(r => r.category === cat) }))
        .filter(group => group.items.length > 0)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const result = await createResearch(formData).catch(() => ({ error: 'Something went wrong. Please try again.' }))

        if (result.error) {
            setError(t(result.error))
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
                <h2>{t('Research Hub')}</h2>
                <p>{t('Academic research, publications, theses, and ongoing scholarly work within AFAQ.')}</p>
                {canCreate && (
                    <button type="button" className={styles.createBtn} onClick={() => setShowModal(true)}>
                        <i className="fa fa-plus" aria-hidden="true"></i> {t('Add Research')}
                    </button>
                )}
            </div>

            {groups.length === 0 ? (
                <div className={styles.emptyState}>
                    <i className="fa fa-scroll" aria-hidden="true"></i>
                    <p>{t('No research entries found.')}</p>
                    {canCreate && <p>{t('Use "Add Research" to create the first entry.')}</p>}
                </div>
            ) : (
                <div className={styles.groupGrid}>
                    {groups.map(group => (
                        <Link
                            key={group.category}
                            href={`/research/category/${group.category}`}
                            className={styles.groupCard}
                        >
                            <div className={styles.groupIcon} aria-hidden="true">
                                <i className={`fa-solid ${CATEGORY_META[group.category]?.icon || 'fa-folder'}`}></i>
                            </div>
                            <div className={styles.groupTitle}>{t(group.category)}</div>
                            <div className={styles.groupCount}>{group.items.length === 1 ? t('1 entry') : t('{n} entries', { n: group.items.length })}</div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} role="dialog" aria-modal="true" aria-labelledby="research-form-title" onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 id="research-form-title">{t('Add New Research')}</h3>
                            <button type="button" className={styles.closeBtn} onClick={() => setShowModal(false)} aria-label={t('Close')}>
                                <i className="fa fa-times" aria-hidden="true"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            {error && <div className={styles.error} role="alert">{error}</div>}

                            <div className={styles.formGroup}>
                                <label htmlFor="title">{t('Title')} *</label>
                                <input type="text" id="title" name="title" required />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="authors">{t('Authors')} *</label>
                                <input
                                    type="text"
                                    id="authors"
                                    name="authors"
                                    placeholder={t('e.g., Ahmed Al-Balushi, Fatma Al-Hashmi')}
                                    required
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="category">{t('Category')} *</label>
                                    <select id="category" name="category" required>
                                        <option value="">{t('Select category')}</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{t(cat)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="publicationDate">{t('Publication Date')}</label>
                                    <input type="date" id="publicationDate" name="publicationDate" />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="abstract">{t('Abstract')} *</label>
                                <textarea
                                    id="abstract"
                                    name="abstract"
                                    rows={5}
                                    placeholder={t('Brief summary of the research...')}
                                    required
                                ></textarea>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="url">{t('External URL (optional)')}</label>
                                <input
                                    type="url"
                                    id="url"
                                    name="url"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setShowModal(false)} disabled={loading}>
                                    {t('Cancel')}
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? t('Adding...') : t('Add Research')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
