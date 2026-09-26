'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../../page.module.css'
import { deleteResearch } from '@/actions/research'

interface Research {
    id: string
    title: string
    abstract: string
    authors: string
    category: string
    publicationDate: string | null
    url: string | null
}

const CATEGORY_META: Record<string, { icon: string; desc: string }> = {
    Published: { icon: 'fa-check-double', desc: 'Peer-reviewed and published work' },
    Ongoing: { icon: 'fa-hourglass-half', desc: 'Active, in-progress research' },
    Thesis: { icon: 'fa-graduation-cap', desc: 'Graduation and academic theses' },
    Conference: { icon: 'fa-people-group', desc: 'Papers presented at conferences' },
    Patent: { icon: 'fa-lightbulb', desc: 'Filed and granted patents' },
}

interface CategoryResearchClientProps {
    category: string
    items: Research[]
    userRole: string | undefined
    isLoggedIn: boolean
}

export default function CategoryResearchClient({ category, items, userRole, isLoggedIn }: CategoryResearchClientProps) {
    const router = useRouter()
    const canDelete = isLoggedIn && userRole === 'ADMIN'

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this research entry?')) return

        const result = await deleteResearch(id)
        if (result.error) {
            alert(result.error)
        } else {
            router.refresh()
        }
    }

    return (
        <main className={styles.main}>
            <Link href="/research" className={styles.categoryBackLink}>
                <i className="fa fa-arrow-left"></i> Back to Research
            </Link>

            <div className={styles.header}>
                <h2>
                    <i className={`fa-solid ${CATEGORY_META[category]?.icon || 'fa-folder'}`}></i> {category}
                </h2>
                <p>{CATEGORY_META[category]?.desc || 'Research entries in this category'}</p>
            </div>

            <div className={styles.grid}>
                {items.length === 0 ? (
                    <div className={styles.emptyState}>
                        <i className="fa fa-scroll"></i>
                        <p>No research entries found in this category.</p>
                    </div>
                ) : (
                    items.map((research, index) => (
                        <Link
                            href={`/research/${research.id}`}
                            key={research.id}
                            className={`${styles.card} ${styles[`animateDelay${(index % 3) + 1}`]}`}
                        >
                            <div className={styles.cardContent}>
                                <h3>{research.title}</h3>
                                <p className={styles.authors}>
                                    <i className="fa fa-users"></i> {research.authors}
                                </p>
                                <p className={styles.abstract}>
                                    {research.abstract.length > 200
                                        ? research.abstract.substring(0, 200) + '...'
                                        : research.abstract}
                                </p>
                                <div className={styles.cardFooter}>
                                    {research.publicationDate && (
                                        <span className={styles.date}>
                                            <i className="fa fa-calendar"></i>
                                            {new Date(research.publicationDate).toLocaleDateString()}
                                        </span>
                                    )}
                                    <span className={styles.link}>
                                        <i className="fa fa-arrow-right"></i> Read more
                                    </span>
                                    {canDelete && (
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={(e) => handleDelete(e, research.id)}
                                        >
                                            <i className="fa fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </main>
    )
}
