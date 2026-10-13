import Link from 'next/link'
import { notFound } from 'next/navigation'
import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import { todayInOman } from '@/lib/utils'
import { ACTION_LABELS, bookingModeFor, getTechnicianResources, unitFor } from '@/lib/equipment'
import TechnicianRequest from '@/components/TechnicianRequest'
import styles from '../page.module.css'

export const dynamic = 'force-dynamic'

export default async function EquipmentCategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
    const { categoryId } = await params

    const categories = await query<RowDataPacket[]>('SELECT * FROM lab_categories WHERE id = ?', [categoryId])
    const category = categories[0]
    if (!category) notFound()

    const items = await query<RowDataPacket[]>('SELECT * FROM labs WHERE categoryId = ? AND isBookable = 1 ORDER BY name', [categoryId])
    const resources = await getTechnicianResources()
    const actionLabel = ACTION_LABELS[bookingModeFor(category.key)]
    const isTools = category.key === 'toolBorrowing'

    return (
        <main className={styles.main}>
            <Link href="/equipment" className={styles.backLink}>
                <i className="fa fa-arrow-left"></i> Back to Workshops, Labs &amp; Tools
            </Link>

            <div className={styles.header}>
                <div className={styles.iconWrapper} style={{ margin: '0 auto 1.25rem' }}>
                    <i className={category.icon || 'fa-solid fa-flask'}></i>
                </div>
                <h2>{category.label}</h2>
                <p>{category.description}</p>
                <span className={styles.labCount}>{unitFor(category.key, items.length)}</span>
            </div>

            {category.technician && (
                <section className={styles.techCard}>
                    <div className={styles.techInfo}>
                        <span className={styles.techAvatar}><i className="fa-solid fa-user-gear"></i></span>
                        <div>
                            <small>Technician in charge</small>
                            <strong>{category.technician}</strong>
                            {category.technicianContact && <span>{category.technicianContact}</span>}
                        </div>
                    </div>
                    <TechnicianRequest resources={resources} minDate={todayInOman()} variant="outline" />
                </section>
            )}

            {items.length === 0 ? (
                <p className={styles.emptyLabs}>Nothing listed in this category yet.</p>
            ) : (
                <div className={styles.labGrid}>
                    {items.map(item => (
                        <Link key={item.id} href={`/lab-booking?labId=${item.id}`} className={styles.labCard}>
                            <div className={styles.labInfo}>
                                <span className={styles.labTag}>{item.tag}</span>
                                <span className={styles.labName}>{item.name}</span>
                                <span className={styles.labDesc}>{item.shortDesc}</span>
                            </div>
                            <div className={styles.labMeta}>
                                {item.location && <span><i className="fa-solid fa-location-dot"></i> {item.location}</span>}
                                <span>
                                    <i className={`fa-solid ${isTools ? 'fa-box' : 'fa-users'}`}></i>
                                    {isTools ? ` ${item.capacity} available` : ` Up to ${item.capacity} people`}
                                </span>
                            </div>
                            <div className={styles.labCardFooter}>
                                <span className={styles.labActionText}>{actionLabel}</span>
                                <i className={`fa-solid fa-arrow-right ${styles.labAction}`}></i>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    )
}
