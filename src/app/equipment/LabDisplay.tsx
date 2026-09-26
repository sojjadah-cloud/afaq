import Link from 'next/link'
import styles from './page.module.css'

interface Category {
    id: string
    key: string
    label: string
    description: string
    icon: string | null
    labCount: number
}

export default function LabDisplay({ categories }: { categories: Category[] }) {
    return (
        <div className={styles.grid}>
            {categories.map((category, index) => (
                <Link
                    key={category.id}
                    href={`/equipment/${category.id}`}
                    className={`${styles.card} ${styles[`animateDelay${(index % 4) + 1}`]}`}
                >
                    <div className={styles.iconWrapper}>
                        <i className={category.icon || 'fa-solid fa-flask'}></i>
                    </div>
                    <h3>{category.label}</h3>
                    <p>{category.description}</p>
                    <span className={styles.labCount}>
                        {category.labCount} {category.labCount === 1 ? 'lab' : 'labs'}
                    </span>
                </Link>
            ))}
        </div>
    )
}
