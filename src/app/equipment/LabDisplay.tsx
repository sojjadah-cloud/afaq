'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

interface Lab {
    id: string
    name: string
    shortDesc: string
    tag: string
}

interface Category {
    id: string
    key: string
    label: string
    description: string
    icon: string | null
    labs: Lab[]
}

export default function LabDisplay({ categories }: { categories: Category[] }) {
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

    return (
        <>
            <div className={styles.grid}>
                {categories.map((category, index) => (
                    <div
                        key={category.id}
                        className={`${styles.card} ${styles[`animateDelay${(index % 4) + 1}`]}`}
                        onClick={() => setSelectedCategory(category)}
                        style={{ cursor: 'pointer', borderColor: selectedCategory?.id === category.id ? 'var(--gold)' : undefined }}
                    >
                        <div className={styles.iconWrapper}>
                            <i className={category.icon || 'fa-solid fa-flask'}></i>
                        </div>
                        <h3>{category.label}</h3>
                        <p>{category.description}</p>
                    </div>
                ))}
            </div>

            {selectedCategory && (
                <section id="lab-list-container" className={styles.detailsSection}>
                    <div className={styles.detailsHeader}>
                        <h3>{selectedCategory.label}</h3>
                        <span>{selectedCategory.description}</span>
                    </div>

                    <div className={styles.labList}>
                        {selectedCategory.labs.map((lab) => (
                            <div key={lab.id} className={styles.labRow}>
                                <Link href={`/lab-booking?labId=${lab.id}`}>
                                    <div className={styles.labInfo}>
                                        <span className={styles.labName}>{lab.name}</span>
                                        <span className={styles.labDesc}>{lab.shortDesc}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span className={styles.labTag}>{lab.tag}</span>
                                        <i className={`fa-solid fa-arrow-right ${styles.labAction}`}></i>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </>
    )
}
