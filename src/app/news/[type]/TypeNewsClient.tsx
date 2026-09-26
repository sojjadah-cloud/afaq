'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../page.module.css'
import { deleteNews } from '@/actions/news'

interface NewsItem {
    id: string
    title: string
    summary: string
    imageUrl: string | null
    type: 'NEWS' | 'ACHIEVEMENT'
    eventDate: string | null
}

const TYPE_META = {
    NEWS: { label: 'News', icon: 'fa-bullhorn' },
    ACHIEVEMENT: { label: 'Achievements', icon: 'fa-trophy' },
}

interface TypeNewsClientProps {
    type: 'NEWS' | 'ACHIEVEMENT'
    items: NewsItem[]
    userRole: string | undefined
    isLoggedIn: boolean
}

export default function TypeNewsClient({ type, items, userRole, isLoggedIn }: TypeNewsClientProps) {
    const router = useRouter()
    const canDelete = isLoggedIn && userRole === 'ADMIN'

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this entry?')) return

        const result = await deleteNews(id)
        if (result.error) {
            alert(result.error)
        } else {
            router.refresh()
        }
    }

    return (
        <main className={styles.main}>
            <Link href="/news" className={styles.categoryBackLink}>
                <i className="fa fa-arrow-left"></i> Back to News &amp; Achievements
            </Link>

            <div className={styles.header}>
                <h2>
                    <i className={`fa-solid ${TYPE_META[type].icon}`}></i> {TYPE_META[type].label}
                </h2>
            </div>

            <div className={styles.grid}>
                {items.length === 0 ? (
                    <div className={styles.emptyState}>
                        <i className="fa fa-newspaper"></i>
                        <p>No entries found.</p>
                    </div>
                ) : (
                    items.map((item, index) => (
                        <div key={item.id} className={`${styles.card} ${item.type === 'ACHIEVEMENT' ? styles.achievementCard : ''} ${styles[`animateDelay${(index % 3) + 1}`]}`}>
                            {item.imageUrl ? (
                                <div className={styles.cardImageWrapper}>
                                    <img src={item.imageUrl} alt={item.title} className={styles.cardImage} />
                                </div>
                            ) : (
                                <div className={styles.cardIcon}>
                                    <i className={`fa-solid ${TYPE_META[item.type].icon}`}></i>
                                </div>
                            )}
                            <div className={styles.cardContent}>
                                <h3>{item.title}</h3>
                                <p className={styles.summary}>{item.summary}</p>
                                <div className={styles.cardFooter}>
                                    {item.eventDate && (
                                        <span className={styles.date}>
                                            <i className="fa fa-calendar"></i>
                                            {new Date(item.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                    )}
                                    {canDelete && (
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <i className="fa fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    )
}
