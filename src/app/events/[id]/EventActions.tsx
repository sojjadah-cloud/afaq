'use client'

import { registerForEvent, cancelRegistration } from '@/actions/events'
import { useState } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import { EVENT_STATUS_LABELS, EventStatus } from '@/lib/eventStatus'
import { useT } from '@/i18n/client'

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
    const t = useT()

    async function handleRegister() {
        if (!confirm(t('Register for this event?'))) return
        setIsLoading(true)
        const result = await registerForEvent(eventId).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        if ('error' in result && result.error) {
            alert(t(result.error))
        }
        setIsLoading(false)
        router.refresh()
    }

    async function handleCancel() {
        if (!confirm(isOpen ? t('Cancel your registration?') : t('Cancel your registration? Registration for this event is closed, so you will not be able to register again.'))) return
        setIsLoading(true)
        const result = await cancelRegistration(eventId).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        if ('error' in result && result.error) {
            alert(t(result.error))
        }
        setIsLoading(false)
        router.refresh()
    }

    const registered = isRegistered && registrationStatus !== 'CANCELLED'
    if (!registered && !isOpen && !isFull) {
        return (
            <div className={styles.actionContainer}>
                <button disabled className={styles.disabledBtn}>
                    {status === 'FINISHED' ? t('Event Ended') : t(EVENT_STATUS_LABELS[status])}
                </button>
            </div>
        )
    }

    if (isRegistered) {
        return (
            <div className={styles.actionContainer}>
                <div className={styles.statusBadge}>
                    <i className="fa-solid fa-check-circle" aria-hidden="true"></i>
                    {registrationStatus === 'CANCELLED' ? t('Registration Cancelled') : t('You are Registered')}
                </div>
                {registrationStatus !== 'CANCELLED' && canCancel && (
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className={styles.cancelBtn}
                    >
                        {isLoading ? t('Processing...') : t('Cancel Registration')}
                    </button>
                )}
                {registrationStatus === 'CANCELLED' && (
                    <button
                        onClick={handleRegister}
                        disabled={isLoading || !isOpen}
                        className={styles.registerBtn}
                    >
                        {isLoading ? t('Processing...') : isFull ? t('Event Full') : t('Re-register')}
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
                {isLoading ? t('Processing...') : isFull ? t('Event Full') : t('Register Now')}
            </button>
            {isFull && <p className={styles.fullMsg}>{t('Registration is currently full.')}</p>}
        </div>
    )
}
