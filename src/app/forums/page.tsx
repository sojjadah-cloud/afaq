import { getForumCategories } from '@/actions/forum'
import Link from 'next/link'
import styles from './page.module.css'
import { pageTitle } from '@/lib/metadata'
import { getT } from '@/i18n/server'

export const generateMetadata = () => pageTitle('Forums')

export const dynamic = 'force-dynamic'

export default async function ForumsPage() {
    const categories = await getForumCategories()
    const { t } = await getT()

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>{t('Community Forums')}</h2>
                <p>{t('Engage with fellow innovators, share ideas, and collaborate on projects')}</p>
            </div>

            <div className={styles.categoryGrid}>
                {categories.length === 0 ? (
                    <div className={styles.emptyState}>
                        <i className="fa fa-comments" aria-hidden="true"></i>
                        <p>{t('No forum categories available yet.')}</p>
                    </div>
                ) : (
                    categories.map((category: any, index: number) => (
                        <Link
                            key={category.id}
                            href={`/forums/${category.id}`}
                            className={`${styles.categoryCard} ${styles[`animateDelay${(index % 3) + 1}`]}`}
                        >
                            <div
                                className={styles.categoryIcon}
                                style={{ background: category.color || '#3b82f6' }}
                                aria-hidden="true"
                            >
                                <i className={`fa ${category.icon || 'fa-comments'}`}></i>
                            </div>
                            <div className={styles.categoryContent}>
                                <h3>{t(category.name)}</h3>
                                <p>{t(category.description)}</p>
                                <div className={styles.categoryMeta}>
                                    <span><i className="fa fa-message" aria-hidden="true"></i> {t('{n} topics', { n: category.topicCount || 0 })}</span>
                                </div>
                            </div>
                            <div className={styles.categoryArrow} aria-hidden="true">
                                <i className="fa fa-chevron-right"></i>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </main>
    )
}
