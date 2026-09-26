import { query } from '@/lib/db'
import styles from './page.module.css'
import BookingForm from './booking-form'
import { RowDataPacket } from '@/lib/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Lab extends RowDataPacket {
    id: string
    name: string
    capacity: number
    location: string
    categoryId: string
}

export default async function LabBookingPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { labId } = await searchParams

    if (!labId || typeof labId !== 'string') {
        return (
            <main className={styles.main}>
                <div className={styles.errorState}>
                    <h2>Invalid Lab Selection</h2>
                    <p>Please select a lab from the equipment page first.</p>
                    <Link href="/equipment" className={styles.backLink}>Go to Equipment</Link>
                </div>
            </main>
        )
    }

    const labs = await query<Lab[]>('SELECT * FROM labs WHERE id = ?', [labId])
    const lab = labs[0]

    if (!lab) {
        return (
            <main className={styles.main}>
                <div className={styles.errorState}>
                    <h2>Lab Not Found</h2>
                    <p>The requested lab could not be found.</p>
                    <Link href="/equipment" className={styles.backLink}>Go to Equipment</Link>
                </div>
            </main>
        )
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <Link href="/equipment" className={styles.backLink}>
                    <i className="fa-solid fa-arrow-left"></i> Back to Equipment
                </Link>
                <h2>Book {lab.name}</h2>
                <p>Reserve this lab for your project work or research.</p>
            </div>

            <div className={styles.content}>
                <div className={`${styles.infoSection} animate-slide-up delay-1`}>
                    <h3>Lab Details</h3>
                    <div className={styles.infoList}>
                        <div className={styles.infoItem}>
                            <div className={styles.infoIcon}>
                                <i className="fa-solid fa-users"></i>
                            </div>
                            <div className={styles.infoItemText}>
                                <h4>Capacity</h4>
                                <p>{lab.capacity} people</p>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoIcon}>
                                <i className="fa-solid fa-location-dot"></i>
                            </div>
                            <div className={styles.infoItemText}>
                                <h4>Location</h4>
                                <p>{lab.location || 'Main Building'}</p>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoIcon}>
                                <i className="fa-solid fa-screwdriver-wrench"></i>
                            </div>
                            <div className={styles.infoItemText}>
                                <h4>Equipment</h4>
                                <p>Standard workbench, soldering station, 3D printer access</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`${styles.bookingSection} animate-slide-up delay-2`}>
                    <h3>Reservation</h3>
                    <BookingForm labId={lab.id} />
                </div>
            </div>
        </main>
    )
}
