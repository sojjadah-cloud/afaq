'use client'

import { createBooking, getAvailability } from '@/actions/labs'
import { useEffect, useState } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'

export type BookingMode = 'book' | 'borrow' | 'access'

const TIME_SLOTS = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00']
const MAX_BORROW_DAYS = 14

const COPY: Record<BookingMode, { date: string; slot: string; submit: string; busy: string; done: string; doneText: string; purpose: string }> = {
    book: {
        date: 'Date',
        slot: 'Time Slot',
        submit: 'Confirm Booking',
        busy: 'Booking...',
        done: 'Booking Requested!',
        doneText: 'Your reservation request has been sent for approval.',
        purpose: 'Briefly describe what you will be working on...',
    },
    borrow: {
        date: 'Pickup date',
        slot: 'Pickup time',
        submit: 'Request to Borrow',
        busy: 'Sending...',
        done: 'Borrow Request Sent!',
        doneText: 'Collect the item from the tool store once your request is approved.',
        purpose: 'What will you use it for?',
    },
    access: {
        date: 'Date',
        slot: 'Time Slot',
        submit: 'Request Access',
        busy: 'Sending...',
        done: 'Access Requested!',
        doneText: 'The workshop technician will confirm your session.',
        purpose: 'Describe the work you need to do in this workshop...',
    },
}

function addDays(date: string, days: number) {
    const d = new Date(`${date}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + days)
    return d.toISOString().slice(0, 10)
}

export default function BookingForm({ labId, mode = 'book', minDate }: { labId: string; mode?: BookingMode; minDate: string }) {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [date, setDate] = useState('')
    const [timeSlot, setTimeSlot] = useState('')
    const [returnDate, setReturnDate] = useState('')
    const [taken, setTaken] = useState<string[]>([])
    const [unitsLeft, setUnitsLeft] = useState<number | null>(null)
    const router = useRouter()
    const copy = COPY[mode]
    const isBorrow = mode === 'borrow'

    useEffect(() => {
        if (!date) return
        let cancelled = false
        getAvailability(labId, date)
            .then(a => {
                if (cancelled) return
                setTaken(a.takenSlots)
                setUnitsLeft(isBorrow ? a.unitsLeft : null)
                setTimeSlot(current => (a.takenSlots.includes(current) ? '' : current))
            })
            .catch(() => { /* availability is a hint; the server re-checks on submit */ })
        return () => { cancelled = true }
    }, [labId, date, isBorrow])

    const changeDate = (value: string) => {
        setDate(value)
        if (!value) {
            setTaken([])
            setUnitsLeft(null)
        }
        if (isBorrow && returnDate && (returnDate < value || returnDate > addDays(value, MAX_BORROW_DAYS))) {
            setReturnDate('')
        }
    }

    // onSubmit rather than a form action: React resets action forms after every
    // submit, which would wipe what the student typed when the server rejects it.
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        setIsSubmitting(true)
        setError(null)
        formData.append('labId', labId)

        const result = await createBooking(formData).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        setIsSubmitting(false)

        if ('error' in result && result.error) {
            setError(result.error)
            if (date) getAvailability(labId, date).then(a => { setTaken(a.takenSlots); setUnitsLeft(isBorrow ? a.unitsLeft : null) }).catch(() => {})
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
                <p>Redirecting to your dashboard...</p>
            </div>
        )
    }

    const allTaken = !isBorrow && date !== '' && taken.length >= TIME_SLOTS.length
    const noUnits = isBorrow && unitsLeft === 0

    return (
        <form onSubmit={handleSubmit} className={styles.bookingForm}>
            {error && <div className={styles.errorMessage} role="alert">{error}</div>}

            <div className={styles.formGroup}>
                <label htmlFor="date">{copy.date}</label>
                <input
                    type="date" id="date" name="date" required min={minDate} className={styles.input}
                    value={date} onChange={e => changeDate(e.target.value)}
                />
                {isBorrow && unitsLeft !== null && (
                    <p className={`${styles.availability} ${noUnits ? styles.availabilityNone : ''}`} aria-live="polite">
                        {noUnits ? 'No units free on this date.' : `${unitsLeft} ${unitsLeft === 1 ? 'unit' : 'units'} free on this date.`}
                    </p>
                )}
                {allTaken && (
                    <p className={`${styles.availability} ${styles.availabilityNone}`} aria-live="polite">
                        Fully booked on this date. Please choose another day.
                    </p>
                )}
            </div>

            {isBorrow && (
                <div className={styles.formGroup}>
                    <label htmlFor="returnDate">Return date</label>
                    <input
                        type="date" id="returnDate" name="returnDate" required className={styles.input}
                        min={date || minDate} max={date ? addDays(date, MAX_BORROW_DAYS) : undefined}
                        value={returnDate} onChange={e => setReturnDate(e.target.value)}
                        disabled={!date}
                    />
                    <p className={styles.availability}>Items can be borrowed for up to {MAX_BORROW_DAYS} days.</p>
                </div>
            )}

            <div className={styles.formGroup}>
                <label htmlFor="timeSlot">{copy.slot}</label>
                <select
                    id="timeSlot" name="timeSlot" required className={styles.select}
                    value={timeSlot} onChange={e => setTimeSlot(e.target.value)}
                >
                    <option value="">Select a time...</option>
                    {TIME_SLOTS.map(slot => {
                        const isTaken = !isBorrow && taken.includes(slot)
                        return (
                            <option key={slot} value={slot} disabled={isTaken}>
                                {slot.replace('-', ' - ')}{isTaken ? ' (booked)' : ''}
                            </option>
                        )
                    })}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="purpose">Purpose</label>
                <textarea id="purpose" name="purpose" required maxLength={500} className={styles.textarea} placeholder={copy.purpose}></textarea>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting || allTaken || noUnits}>
                {isSubmitting ? copy.busy : copy.submit}
            </button>
        </form>
    )
}
