import Link from 'next/link'
import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import { todayInOman } from '@/lib/utils'
import { getTechnicianResources, unitFor } from '@/lib/equipment'
import TechnicianRequest from '@/components/TechnicianRequest'
import styles from './page.module.css'
import { pageTitle } from '@/lib/metadata'
import { getT } from '@/i18n/server'

export const generateMetadata = () => pageTitle('Workshops, Labs & Tools')

export const dynamic = 'force-dynamic'

const STEPS = [
    { icon: 'fa-magnifying-glass', title: 'Choose', text: 'Find the workshop, lab or tool you need.' },
    { icon: 'fa-calendar-check', title: 'Book or borrow', text: 'Pick a date and time slot and tell us the purpose.' },
    { icon: 'fa-user-gear', title: 'Get support', text: 'Coordinate with a technician for training or setup.' },
]

export default async function EquipmentPage() {
    const { t } = await getT()
    const categories = await query<RowDataPacket[]>(
        `SELECT c.id, c.key, c.label, c.description, c.icon, c.technician,
                (SELECT COUNT(*) FROM labs l WHERE l.categoryId = c.id AND l.isBookable = 1) as resourceCount
         FROM lab_categories c
         ORDER BY c.sortOrder, c.createdAt`
    )
    const resources = await getTechnicianResources()

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>{t('Workshops, Labs & Tools')}</h2>
                <p>{t('Club workshops, external workshops, specialised labs and tools you can borrow for your project.')}</p>
                <div className={styles.headerAction}>
                    <TechnicianRequest resources={resources} minDate={todayInOman()} />
                </div>
            </div>

            <div className={styles.categoryGrid}>
                {categories.map(category => (
                    <Link key={category.id} href={`/equipment/${category.id}`} className={styles.categoryCard}>
                        <div className={styles.iconWrapper} aria-hidden="true">
                            <i className={category.icon || 'fa-solid fa-flask'}></i>
                        </div>
                        <h3>{t(category.label)}</h3>
                        <p>{t(category.description)}</p>
                        <div className={styles.categoryFooter}>
                            <span className={styles.labCount}>{unitFor(category.key, Number(category.resourceCount), t)}</span>
                            {category.technician && (
                                <span className={styles.technician}>
                                    <i className="fa-solid fa-user-gear" aria-hidden="true"></i> {category.technician}
                                </span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            <section className={styles.steps} aria-label={t('How it works')}>
                {STEPS.map((step, i) => (
                    <div key={step.title} className={styles.step}>
                        <span className={styles.stepIcon} aria-hidden="true"><i className={`fa-solid ${step.icon}`}></i></span>
                        <div>
                            <strong>{i + 1}. {t(step.title)}</strong>
                            <p>{t(step.text)}</p>
                        </div>
                    </div>
                ))}
            </section>
        </main>
    )
}
