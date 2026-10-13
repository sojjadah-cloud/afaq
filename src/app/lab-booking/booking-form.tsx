'use client'

import { createBooking } from '@/actions/labs'
import { useState } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'

export type BookingMode = 'book' | 'borrow' | 'access'

const COPY: Record<BookingMode, { date: string; submit: string; busy: string; done: string; doneText: string; purpose: string }> = {
    book: {
        date: 'Date',
        submit: 'Confirm Booking',
        busy: 'Booking...',
        done: 'Booking Requested!',
        doneText: 'Your reservation request has been sent for approval.',
        purpose: 'Briefly describe what you will be working on...',
    },
    borrow: {
        date: 'Pickup date',
        submit: 'Request to Borrow',
        busy: 'Sending...',
        done: 'Borrow Request Sent!',
        doneText: 'Collect the item from the tool store once your request is approved.',
        purpose: 'What will you use it for, and for how long do you need it?',
    },
    access: {
        date: 'Date',
        submit: 'Request Access',
        busy: 'Sending...',
        done: 'Access Requested!',
        doneText: 'The workshop technician will confirm your session.',
        purpose: 'Describe the work you need to do in this workshop...',
    },
}

export default function BookingForm({ labId, mode = 'book', minDate }: { labId: string; mode?: BookingMode; minDate: string }) {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const copy = COPY[mode]

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        setError(null)
        formData.append('labId', labId)

        const result = await createBooking(formData)
        setIsSubmitting(false)

        if (result?.error) {
            setError(result.error)
        } else {
            setSuccess(true)
            setTimeout(() => router.push('/student'), 2000)
        }
    }

    if (success) {
        return (
            <div className={styles.successState}>
                <div className={styles.successIcon}><i className="fa fa-check-circle"></i></div>
                <h3>{copy.done}</h3>
                <p>{copy.doneText}</p>
                <p>Redirecting to your profile...</p>
            </div>
        )
    }

    return (
        <form action={handleSubmit} className={styles.bookingForm}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.formGroup}>
                <label htmlFor="date">{copy.date}</label>
                <input type="date" id="date" name="date" required min={minDate} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="timeSlot">Time Slot</label>
                <select id="timeSlot" name="timeSlot" required className={styles.select}>
                    <option value="">Select a time...</option>
                    <option value="08:00-10:00">08:00 - 10:00</option>
                    <option value="10:00-12:00">10:00 - 12:00</option>
                    <option value="12:00-14:00">12:00 - 14:00</option>
                    <option value="14:00-16:00">14:00 - 16:00</option>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="purpose">Purpose</label>
                <textarea id="purpose" name="purpose" required className={styles.textarea} placeholder={copy.purpose}></textarea>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? copy.busy : copy.submit}
            </button>
        </form>
    )
}
