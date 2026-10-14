'use client'

import { useState } from 'react'
import { requestTechnician } from '@/actions/labs'
import styles from './TechnicianRequest.module.css'
import { useT } from '@/i18n/client'

export interface TechnicianResource {
    id: string
    name: string
    category: string
}

const SUPPORT_TYPES = ['Equipment training', 'Setup & configuration', 'Fault or repair', 'Supervision during use', 'Other']

export default function TechnicianRequest({
    resources,
    defaultResourceId = '',
    minDate,
    variant = 'solid',
}: {
    resources: TechnicianResource[]
    defaultResourceId?: string
    minDate: string
    variant?: 'solid' | 'outline'
}) {
    const t = useT()
    const [open, setOpen] = useState(false)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')
    const [sent, setSent] = useState(false)

    const groups = resources.reduce((acc, r) => {
        (acc[r.category] ||= []).push(r)
        return acc
    }, {} as Record<string, TechnicianResource[]>)

    const close = () => {
        setOpen(false)
        setError('')
        setSent(false)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSending(true)
        setError('')
        const result = await requestTechnician(new FormData(e.currentTarget)).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        setSending(false)
        if (result.error) setError(t(result.error))
        else setSent(true)
    }

    return (
        <>
            <button type="button" className={variant === 'solid' ? styles.trigger : styles.triggerOutline} onClick={() => setOpen(true)}>
                <i className="fa-solid fa-user-gear" aria-hidden="true"></i> {t('Coordinate with a Technician')}
            </button>

            {open && (
                <div className={styles.overlay} onClick={close}>
                    <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="tech-title" onClick={e => e.stopPropagation()}>
                        <div className={styles.header}>
                            <h3 id="tech-title"><i className="fa-solid fa-user-gear" aria-hidden="true"></i> {t('Coordinate with a Technician')}</h3>
                            <button type="button" className={styles.close} onClick={close} aria-label={t('Close')}>
                                <i className="fa fa-times" aria-hidden="true"></i>
                            </button>
                        </div>

                        {sent ? (
                            <div className={styles.done}>
                                <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
                                <h4>{t('Request sent')}</h4>
                                <p>{t('A technician will contact you to confirm a time. You can follow up from your notifications.')}</p>
                                <button type="button" className={styles.submit} onClick={close}>{t('Close')}</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <p className={styles.intro}>
                                    {t('Ask a technician for training, setup, supervision or help with a fault before or during your session.')}
                                </p>

                                <label className={styles.field}>
                                    <span>{t('Lab, workshop or tool')} *</span>
                                    <select name="resourceId" required defaultValue={defaultResourceId}>
                                        <option value="">{t('Select...')}</option>
                                        {Object.entries(groups).map(([category, items]) => (
                                            <optgroup key={category} label={t(category)}>
                                                {items.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                            </optgroup>
                                        ))}
                                    </select>
                                </label>

                                <label className={styles.field}>
                                    <span>{t('Type of support')} *</span>
                                    <select name="supportType" required defaultValue="">
                                        <option value="">{t('Select...')}</option>
                                        {SUPPORT_TYPES.map(type => <option key={type} value={type}>{t(type)}</option>)}
                                    </select>
                                </label>

                                <div className={styles.row}>
                                    <label className={styles.field}>
                                        <span>{t('Preferred date')}</span>
                                        <input type="date" name="preferredDate" min={minDate} />
                                    </label>
                                    <label className={styles.field}>
                                        <span>{t('Time')}</span>
                                        <select name="timeSlot" defaultValue="">
                                            <option value="">{t('Flexible')}</option>
                                            <option value="08:00-10:00">08:00 - 10:00</option>
                                            <option value="10:00-12:00">10:00 - 12:00</option>
                                            <option value="12:00-14:00">12:00 - 14:00</option>
                                            <option value="14:00-16:00">14:00 - 16:00</option>
                                        </select>
                                    </label>
                                </div>

                                <label className={styles.field}>
                                    <span>{t('Details')} *</span>
                                    <textarea name="details" rows={4} required maxLength={2000} placeholder={t('What are you working on and what help do you need?')}></textarea>
                                </label>

                                {error && <div className={styles.error} role="alert">{error}</div>}

                                <div className={styles.actions}>
                                    <button type="button" className={styles.cancel} onClick={close} disabled={sending}>{t('Cancel')}</button>
                                    <button type="submit" className={styles.submit} disabled={sending}>
                                        {sending ? t('Sending...') : t('Send Request')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
