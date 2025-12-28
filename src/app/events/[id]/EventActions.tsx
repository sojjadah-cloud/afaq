'use client'

import { registerForEvent, cancelRegistration } from '@/actions/events'
import { useState } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'

export default function EventActions({
    eventId,
    isRegistered,
    registrationStatus,
    isFull,
    isPast
}: {
    eventId: string
    isRegistered: boolean
    registrationStatus?: string
    isFull: boolean
    isPast: boolean
}) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleRegister() {
        if (!confirm('Register for this event?')) return
        setIsLoading(true)
        const result = await registerForEvent(eventId)
        if (result.error) {
            alert(result.error)
        }
        setIsLoading(false)
        router.refresh()
    }

    async function handleCancel() {
        if (!confirm('Cancel your registration?')) return
        setIsLoading(true)
        const result = await cancelRegistration(eventId)
        if (result.error) {
            alert(result.error)
        }
        setIsLoading(false)
        router.refresh()
    }

    if (isPast) {
        return (
            <div className={styles.actionContainer}>
                <button disabled className={styles.disabledBtn}>
                    Event Ended
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
                {registrationStatus !== 'CANCELLED' && (
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
                        disabled={isLoading || isFull}
                        className={styles.registerBtn}
                    >
                        {isLoading ? 'Processing...' : 'Re-register'}
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
