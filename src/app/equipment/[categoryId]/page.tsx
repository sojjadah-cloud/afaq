import { query } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RowDataPacket } from '@/lib/types'
import styles from '../page.module.css'

export const dynamic = 'force-dynamic'

interface LabCategory extends RowDataPacket {
    id: string
    label: string
    description: string
    icon: string | null
}

interface Lab extends RowDataPacket {
    id: string
    name: string
    shortDesc: string
    tag: string
}

export default async function EquipmentCategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
    const { categoryId } = await params

    const categories = await query<LabCategory[]>('SELECT * FROM lab_categories WHERE id = ?', [categoryId])
    const category = categories[0]

    if (!category) {
        notFound()
    }

    const labs = await query<Lab[]>('SELECT * FROM labs WHERE categoryId = ?', [categoryId])

    return (
        <main className={styles.main}>
            <Link href="/equipment" className={styles.backLink}>
                <i className="fa fa-arrow-left"></i> Back to Equipment
            </Link>

            <div className={styles.header}>
                <div className={styles.iconWrapper} style={{ margin: '0 auto 1.5rem' }}>
                    <i className={category.icon || 'fa-solid fa-flask'}></i>
                </div>
                <h2>{category.label}</h2>
                <p>{category.description}</p>
            </div>

            {labs.length === 0 ? (
                <p className={styles.emptyLabs}>No labs in this category yet.</p>
            ) : (
                <div className={styles.labGrid}>
                    {labs.map((lab) => (
                        <Link key={lab.id} href={`/lab-booking?labId=${lab.id}`} className={styles.labCard}>
                            <div className={styles.labInfo}>
                                <span className={styles.labName}>{lab.name}</span>
                                <span className={styles.labDesc}>{lab.shortDesc}</span>
                            </div>
                            <div className={styles.labCardFooter}>
                                <span className={styles.labTag}>{lab.tag}</span>
                                <i className={`fa-solid fa-arrow-right ${styles.labAction}`}></i>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    )
}
