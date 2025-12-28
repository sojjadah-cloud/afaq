'use client'

import { createBooking } from '@/actions/labs'
import { useState } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'

export default function BookingForm({ labId }: { labId: string }) {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        setError(null)
        setSuccess(false)

        // Append labId to formData since it's not in an input
        formData.append('labId', labId)

        const result = await createBooking(formData)

        if (result?.error) {
            setError(result.error)
            setIsSubmitting(false)
        } else {
            setSuccess(true)
            setIsSubmitting(false)
            // Redirect to profile or show success message
            setTimeout(() => {
                router.push('/student')
            }, 2000)
        }
    }

    if (success) {
        return (
            <div className={styles.successState}>
                <div className={styles.successIcon}><i className="fa fa-check-circle"></i></div>
                <h3>Booking Confirmed!</h3>
                <p>Your reservation request has been submitted successfully.</p>
                <p>Redirecting to your profile...</p>
            </div>
        )
    }

    return (
        <form action={handleSubmit} className={styles.bookingForm}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.formGroup}>
                <label>Date</label>
                <input type="date" name="date" required className={styles.input} />
            </div>

            <div className={styles.formGroup}>
                <label>Time Slot</label>
                <select name="timeSlot" required className={styles.select}>
                    <option value="">Select a time...</option>
                    <option value="08:00-10:00">08:00 - 10:00</option>
                    <option value="10:00-12:00">10:00 - 12:00</option>
                    <option value="12:00-14:00">12:00 - 14:00</option>
                    <option value="14:00-16:00">14:00 - 16:00</option>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label>Purpose</label>
                <textarea name="purpose" required className={styles.textarea} placeholder="Briefly describe what you will be working on..."></textarea>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
        </form>
    )
}
