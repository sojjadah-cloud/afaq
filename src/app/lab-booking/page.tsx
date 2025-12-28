import { query } from '@/lib/db'
import styles from './page.module.css'
import BookingForm from './booking-form'
import { RowDataPacket } from 'mysql2'
import Link from 'next/link'

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
                <Link href="/equipment" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#718096', fontWeight: 600 }}>
                    <i className="fa-solid fa-arrow-left"></i> Back to Equipment
                </Link>
                <h2>Book {lab.name}</h2>
                <p>Reserve this lab for your project work or research.</p>
            </div>

            <div className={styles.content}>
                <div className={`${styles.infoSection} animate-slide-up delay-1`}>
                    <h3>Lab Details</h3>
                    <div className={styles.infoText}>
                        <p style={{ marginBottom: '0.5rem' }}><i className="fa-solid fa-users" style={{ color: 'var(--gold)', marginRight: '8px' }}></i> <strong>Capacity:</strong> {lab.capacity} people</p>
                        <p style={{ marginBottom: '0.5rem' }}><i className="fa-solid fa-location-dot" style={{ color: 'var(--gold)', marginRight: '8px' }}></i> <strong>Location:</strong> {lab.location || 'Main Building'}</p>
                        <p><i className="fa-solid fa-screwdriver-wrench" style={{ color: 'var(--gold)', marginRight: '8px' }}></i> <strong>Equipment:</strong> Standard workbench, soldering station, 3D printer access</p>
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
