import Link from 'next/link'
import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import { todayInOman } from '@/lib/utils'
import { bookingModeFor, getTechnicianResources } from '@/lib/equipment'
import TechnicianRequest from '@/components/TechnicianRequest'
import BookingForm from './booking-form'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

const HEADINGS = {
    book: { verb: 'Book', text: 'Reserve this space for your project work or research.', panel: 'Reservation' },
    borrow: { verb: 'Borrow', text: 'Request this item for your project. Collect it from the tool store once approved.', panel: 'Borrow request' },
    access: { verb: 'Request access to', text: 'External workshops are used by arrangement with their technician.', panel: 'Access request' },
}

function NotFoundState({ title, text }: { title: string; text: string }) {
    return (
        <main className={styles.main}>
            <div className={styles.errorState}>
                <h2>{title}</h2>
                <p>{text}</p>
                <Link href="/equipment" className={styles.backLink}>Go to Workshops, Labs &amp; Tools</Link>
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
    if (!labId || typeof labId !== 'string') {
        return <NotFoundState title="Choose a lab or tool" text="Select a workshop, lab or tool first." />
    }

    const rows = await query<RowDataPacket[]>(
        `SELECT l.*, c.id as categoryId, c.key as categoryKey, c.label as categoryLabel, c.technician, c.technicianContact
         FROM labs l JOIN lab_categories c ON c.id = l.categoryId WHERE l.id = ?`,
        [labId]
    )
    const lab = rows[0]
    if (!lab) {
        return <NotFoundState title="Not found" text="The requested lab or tool could not be found." />
    }
    if (!lab.isBookable) {
        return <NotFoundState title="Not available" text="This item is currently not available for booking." />
    }

    const mode = bookingModeFor(lab.categoryKey)
    const heading = HEADINGS[mode]
    const today = todayInOman()
    const resources = await getTechnicianResources()

    const details = [
        { icon: 'fa-layer-group', label: 'Category', value: lab.categoryLabel },
        { icon: 'fa-location-dot', label: 'Location', value: lab.location || 'Ask the technician' },
        mode === 'borrow'
            ? { icon: 'fa-box', label: 'Available', value: `${lab.capacity} ${lab.capacity === 1 ? 'unit' : 'units'}` }
            : { icon: 'fa-users', label: 'Capacity', value: `Up to ${lab.capacity} ${lab.capacity === 1 ? 'person' : 'people'}` },
        { icon: 'fa-screwdriver-wrench', label: 'What it offers', value: lab.shortDesc },
        { icon: 'fa-user-gear', label: 'Technician', value: [lab.technician, lab.technicianContact].filter(Boolean).join(' · ') || 'Club technicians' },
    ]

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <Link href={`/equipment/${lab.categoryId}`} className={styles.backLink}>
                    <i className="fa-solid fa-arrow-left"></i> Back to {lab.categoryLabel}
                </Link>
                <h2>{heading.verb} {lab.name}</h2>
                <p>{heading.text}</p>
            </div>

            <div className={styles.content}>
                <div className={`${styles.infoSection} animate-slide-up delay-1`}>
                    <h3>Details</h3>
                    <div className={styles.infoList}>
                        {details.map(d => (
                            <div key={d.label} className={styles.infoItem}>
                                <div className={styles.infoIcon}>
                                    <i className={`fa-solid ${d.icon}`}></i>
                                </div>
                                <div className={styles.infoItemText}>
                                    <h4>{d.label}</h4>
                                    <p>{d.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.techAction}>
                        <p>Need training, setup or supervision?</p>
                        <TechnicianRequest resources={resources} defaultResourceId={lab.id} minDate={today} variant="outline" />
                    </div>
                </div>

                <div className={`${styles.bookingSection} animate-slide-up delay-2`}>
                    <h3>{heading.panel}</h3>
                    <BookingForm labId={lab.id} mode={mode} minDate={today} />
                </div>
            </div>
        </main>
    )
}
