import { getForumCategories } from '@/actions/forum'
import Link from 'next/link'
import styles from './page.module.css'

export default async function ForumsPage() {
    const categories = await getForumCategories()

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>Community Forums</h2>
                <p>Engage with fellow innovators, share ideas, and collaborate on projects</p>
            </div>

            <div className={styles.categoryGrid}>
                {categories.length === 0 ? (
                    <div className={styles.emptyState}>
                        <i className="fa fa-comments"></i>
                        <p>No forum categories available yet.</p>
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
                            >
                                <i className={`fa ${category.icon || 'fa-comments'}`}></i>
                            </div>
                            <div className={styles.categoryContent}>
                                <h3>{category.name}</h3>
                                <p>{category.description}</p>
                                <div className={styles.categoryMeta}>
                                    <span><i className="fa fa-message"></i> {category.topicCount || 0} topics</span>
                                </div>
                            </div>
                            <div className={styles.categoryArrow}>
                                <i className="fa fa-chevron-right"></i>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </main>
    )
}
