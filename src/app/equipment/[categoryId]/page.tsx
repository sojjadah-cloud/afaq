import Link from 'next/link'
import { notFound } from 'next/navigation'
import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import { todayInOman } from '@/lib/utils'
import { ACTION_LABELS, bookingModeFor, getTechnicianResources, unitFor } from '@/lib/equipment'
import TechnicianRequest from '@/components/TechnicianRequest'
import styles from '../page.module.css'
import { getT } from '@/i18n/server'
import { recordTitle } from '@/lib/metadata'

export async function generateMetadata({ params }: { params: Promise<{ categoryId: string }> }) {
    const { categoryId } = await params
    return recordTitle('SELECT label as title FROM lab_categories WHERE id = ?', categoryId, 'Workshops, Labs & Tools')
}

export const dynamic = 'force-dynamic'

export default async function EquipmentCategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
    const { categoryId } = await params
    const { t } = await getT()

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
                <i className="fa fa-arrow-left" aria-hidden="true"></i> {t('Back to {name}', { name: t('Workshops, Labs & Tools') })}
            </Link>

            <div className={styles.header}>
                <div className={styles.iconWrapper} style={{ margin: '0 auto 1.25rem' }} aria-hidden="true">
                    <i className={category.icon || 'fa-solid fa-flask'}></i>
                </div>
                <h2>{t(category.label)}</h2>
                <p>{t(category.description)}</p>
                <span className={styles.labCount}>{unitFor(category.key, items.length, t)}</span>
            </div>

            {category.technician && (
                <section className={styles.techCard}>
                    <div className={styles.techInfo}>
                        <span className={styles.techAvatar} aria-hidden="true"><i className="fa-solid fa-user-gear"></i></span>
                        <div>
                            <small>{t('Technician in charge')}</small>
                            <strong>{category.technician}</strong>
                            {category.technicianContact && <span dir="ltr">{category.technicianContact}</span>}
                        </div>
                    </div>
                    <TechnicianRequest resources={resources} minDate={todayInOman()} variant="outline" />
                </section>
            )}

            {items.length === 0 ? (
                <p className={styles.emptyLabs}>{t('Nothing listed in this category yet.')}</p>
            ) : (
                <div className={styles.labGrid}>
                    {items.map(item => (
                        <Link key={item.id} href={`/lab-booking?labId=${item.id}`} className={styles.labCard}>
                            <div className={styles.labInfo}>
                                <span className={styles.labTag}>{t(item.tag)}</span>
                                <span className={styles.labName}>{item.name}</span>
                                <span className={styles.labDesc}>{item.shortDesc}</span>
                            </div>
                            <div className={styles.labMeta}>
                                {item.location && <span><i className="fa-solid fa-location-dot" aria-hidden="true"></i> {item.location}</span>}
                                <span>
                                    <i className={`fa-solid ${isTools ? 'fa-box' : 'fa-users'}`} aria-hidden="true"></i>
                                    {' '}{isTools ? t('{n} available', { n: item.capacity }) : t('Up to {n} people', { n: item.capacity })}
                                </span>
                            </div>
                            <div className={styles.labCardFooter}>
                                <span className={styles.labActionText}>{t(actionLabel)}</span>
                                <i className={`fa-solid fa-arrow-right ${styles.labAction}`} aria-hidden="true"></i>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    )
}
