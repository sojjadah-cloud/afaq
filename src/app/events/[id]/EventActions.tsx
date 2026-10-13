'use client'

import { registerForEvent, cancelRegistration } from '@/actions/events'
import { useState } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import { EVENT_STATUS_LABELS, EventStatus } from '@/lib/eventStatus'

export default function EventActions({
    eventId,
    isRegistered,
    registrationStatus,
    status,
    canCancel
}: {
    eventId: string
    isRegistered: boolean
    registrationStatus?: string
    status: EventStatus
    canCancel: boolean
}) {
    const isFull = status === 'FULL'
    const isOpen = status === 'OPEN'
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleRegister() {
        if (!confirm('Register for this event?')) return
        setIsLoading(true)
        const result = await registerForEvent(eventId).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        if ('error' in result && result.error) {
            alert(result.error)
        }
        setIsLoading(false)
        router.refresh()
    }

    async function handleCancel() {
        if (!confirm(isOpen ? 'Cancel your registration?' : 'Cancel your registration? Registration for this event is closed, so you will not be able to register again.')) return
        setIsLoading(true)
        const result = await cancelRegistration(eventId).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        if ('error' in result && result.error) {
            alert(result.error)
        }
        setIsLoading(false)
        router.refresh()
    }

    const registered = isRegistered && registrationStatus !== 'CANCELLED'
    if (!registered && !isOpen && !isFull) {
        return (
            <div className={styles.actionContainer}>
                <button disabled className={styles.disabledBtn}>
                    {status === 'FINISHED' ? 'Event Ended' : EVENT_STATUS_LABELS[status]}
                </button>
            </div>
        )
    }

    if (isRegistered) {
        return (
            <div className={styles.actionContainer}>
                <div className={styles.statusBadge}>
                    <i className="fa-solid fa-check-circle"></i>
                    {registrationStatus === 'CANCELLED' ? 'Registration Cancelled' : 'You are Registered'}
                </div>
                {registrationStatus !== 'CANCELLED' && canCancel && (
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className={styles.cancelBtn}
                    >
                        {isLoading ? 'Processing...' : 'Cancel Registration'}
                    </button>
                )}
                {registrationStatus === 'CANCELLED' && (
                    <button
                        onClick={handleRegister}
                        disabled={isLoading || !isOpen}
                        className={styles.registerBtn}
                    >
                        {isLoading ? 'Processing...' : isFull ? 'Event Full' : 'Re-register'}
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className={styles.actionContainer}>
            <button
                onClick={handleRegister}
                disabled={isLoading || isFull}
                className={styles.registerBtn}
            >
                {isLoading ? 'Processing...' : isFull ? 'Event Full' : 'Register Now'}
            </button>
            {isFull && <p className={styles.fullMsg}>Registration is currently full.</p>}
        </div>
    )
}
