import Link from 'next/link'
import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import { todayInOman } from '@/lib/utils'
import { bookingModeFor, getTechnicianResources } from '@/lib/equipment'
import TechnicianRequest from '@/components/TechnicianRequest'
import BookingForm from './booking-form'
import styles from './page.module.css'
import { getT } from '@/i18n/server'
import type { TFunction } from '@/i18n/core'
import { pageTitle } from '@/lib/metadata'

export const generateMetadata = () => pageTitle('Book or Borrow')

export const dynamic = 'force-dynamic'

const HEADINGS = {
    book: { verb: 'Book {name}', text: 'Reserve this space for your project work or research.', panel: 'Reservation' },
    borrow: { verb: 'Borrow {name}', text: 'Request this item for your project. Collect it from the tool store once approved.', panel: 'Borrow request' },
    access: { verb: 'Request access to {name}', text: 'External workshops are used by arrangement with their technician.', panel: 'Access request' },
}

function NotFoundState({ title, text, t }: { title: string; text: string; t: TFunction }) {
    return (
        <main className={styles.main}>
            <div className={styles.errorState}>
                <h2>{t(title)}</h2>
                <p>{t(text)}</p>
                <Link href="/equipment" className={styles.backLink}>{t('Go to Workshops, Labs & Tools')}</Link>
            </div>
        </main>
    )
}

export default async function LabBookingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { labId } = await searchParams
    const { t } = await getT()
    if (!labId || typeof labId !== 'string') {
        return <NotFoundState t={t} title="Choose a lab or tool" text="Select a workshop, lab or tool first." />
    }

    const rows = await query<RowDataPacket[]>(
        `SELECT l.*, c.id as categoryId, c.key as categoryKey, c.label as categoryLabel, c.technician, c.technicianContact
         FROM labs l JOIN lab_categories c ON c.id = l.categoryId WHERE l.id = ?`,
        [labId]
    )
    const lab = rows[0]
    if (!lab) {
        return <NotFoundState t={t} title="Not found" text="The requested lab or tool could not be found." />
    }
    if (!lab.isBookable) {
        return <NotFoundState t={t} title="Not available" text="This item is currently not available for booking." />
    }

    const mode = bookingModeFor(lab.categoryKey)
    const heading = HEADINGS[mode]
    const today = todayInOman()
    const resources = await getTechnicianResources()

    const details = [
        { icon: 'fa-layer-group', label: 'Category', value: t(lab.categoryLabel) },
        { icon: 'fa-location-dot', label: 'Location', value: lab.location || t('Ask the technician') },
        mode === 'borrow'
            ? { icon: 'fa-box', label: 'Units in store', value: t('{n} units', { n: lab.capacity }) }
            : { icon: 'fa-users', label: 'Capacity', value: t('Up to {n} people', { n: lab.capacity }) },
        { icon: 'fa-screwdriver-wrench', label: 'What it offers', value: lab.shortDesc },
        { icon: 'fa-user-gear', label: 'Technician', value: [lab.technician, lab.technicianContact].filter(Boolean).join(' · ') || t('Club technicians') },
    ]

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <Link href={`/equipment/${lab.categoryId}`} className={styles.backLink}>
                    <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> {t('Back to {name}', { name: t(lab.categoryLabel) })}
                </Link>
                <h2>{t(heading.verb, { name: lab.name })}</h2>
                <p>{t(heading.text)}</p>
            </div>

            <div className={styles.content}>
                <div className={`${styles.infoSection} animate-slide-up delay-1`}>
                    <h3>{t('Details')}</h3>
                    <div className={styles.infoList}>
                        {details.map(d => (
                            <div key={d.label} className={styles.infoItem}>
                                <div className={styles.infoIcon} aria-hidden="true">
                                    <i className={`fa-solid ${d.icon}`}></i>
                                </div>
                                <div className={styles.infoItemText}>
                                    <h4>{t(d.label)}</h4>
                                    <p>{d.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.techAction}>
                        <p>{t('Need training, setup or supervision?')}</p>
                        <TechnicianRequest resources={resources} defaultResourceId={lab.id} minDate={today} variant="outline" />
                    </div>
                </div>

                <div className={`${styles.bookingSection} animate-slide-up delay-2`}>
                    <h3>{t(heading.panel)}</h3>
                    <BookingForm labId={lab.id} mode={mode} minDate={today} />
                </div>
            </div>
        </main>
    )
}
