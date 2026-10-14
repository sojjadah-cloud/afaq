'use client'

import { useState, useRef } from 'react'
import styles from './page.module.css'
import { submitClubRegistration } from '@/actions/club'
import { useT } from '@/i18n/client'

export default function JoinClub({ departments }: { departments: string[] }) {
    const t = useT()
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const formRef = useRef<HTMLFormElement>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        const formData = new FormData(e.currentTarget)
        const result = await submitClubRegistration(formData).catch(() => ({ error: 'Something went wrong. Please try again.', message: '' }))

        if (result.error) {
            setMessage({ type: 'error', text: t(result.error) })
        } else {
            setMessage({ type: 'success', text: t(result.message || 'Registration submitted!') })
            formRef.current?.reset()
            setShowForm(false)
        }
        setLoading(false)
    }

    return (
        <>
            <section id="join" className={styles.registerSection}>
                <div className={styles.registerCta}>
                    <div className={styles.registerCtaIcon} aria-hidden="true">
                        <i className="fa fa-user-plus"></i>
                    </div>
                    <div className={styles.registerCtaText}>
                        <h2>{t('Join the Scientific Club')}</h2>
                        <p>{t('Be part of our innovation community and contribute to groundbreaking projects and research.')}</p>
                    </div>
                    <button type="button" className={styles.registerCtaBtn} onClick={() => setShowForm(true)}>
                        <i className="fa fa-paper-plane" aria-hidden="true"></i> {t('Register Now')}
                    </button>
                </div>
            </section>

            {message.text && (
                <div className={`${styles.toast} ${styles[message.type]}`} role={message.type === 'error' ? 'alert' : 'status'}>
                    <i className={`fa ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} aria-hidden="true"></i>
                    {message.text}
                </div>
            )}

            {showForm && (
                <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
                    <div className={styles.modalContent} role="dialog" aria-modal="true" aria-labelledby="join-title" onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 id="join-title">{t('Join the Scientific Club')}</h3>
                            <button type="button" className={styles.closeBtn} onClick={() => setShowForm(false)} aria-label={t('Close')}>
                                <i className="fa fa-times" aria-hidden="true"></i>
                            </button>
                        </div>

                        <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
                            <ul className={styles.modalBenefits}>
                                <li><i className="fa fa-check" aria-hidden="true"></i> {t('Access to innovation labs and equipment')}</li>
                                <li><i className="fa fa-check" aria-hidden="true"></i> {t('Collaborate on cutting-edge projects')}</li>
                                <li><i className="fa fa-check" aria-hidden="true"></i> {t('Networking with industry experts')}</li>
                                <li><i className="fa fa-check" aria-hidden="true"></i> {t('Exclusive workshops and training')}</li>
                            </ul>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="fullName">{t('Full Name')} *</label>
                                    <input type="text" id="fullName" name="fullName" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="militaryId">{t('Military ID')} *</label>
                                    <input type="text" id="militaryId" name="militaryId" required />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="email">{t('Email')} *</label>
                                    <input type="email" id="email" name="email" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="phone">{t('Phone')}</label>
                                    <input type="tel" id="phone" name="phone" />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="department">{t('Department')} *</label>
                                    <select id="department" name="department" required>
                                        <option value="">{t('Select department')}</option>
                                        {departments.map(d => (
                                            <option key={d} value={d}>{t(d)}</option>
                                        ))}
                                        <option value="Other">{t('Other')}</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="yearLevel">{t('Year Level')}</label>
                                    <select id="yearLevel" name="yearLevel">
                                        <option value="">{t('Select year')}</option>
                                        <option value="Level 1">{t('Level 1')}</option>
                                        <option value="Level 2">{t('Level 2')}</option>
                                        <option value="Level 3">{t('Level 3')}</option>
                                        <option value="Level 4">{t('Level 4')}</option>
                                        <option value="Graduate">{t('Graduate')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="interests">{t('Areas of Interest')}</label>
                                <input
                                    type="text"
                                    id="interests"
                                    name="interests"
                                    placeholder={t('e.g., Cybersecurity, IoT, AI, Robotics')}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="motivation">{t('Why do you want to join?')}</label>
                                <textarea
                                    id="motivation"
                                    name="motivation"
                                    rows={3}
                                    placeholder={t('Tell us about your motivation...')}
                                ></textarea>
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setShowForm(false)} disabled={loading}>{t('Cancel')}</button>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? (
                                        <><i className="fa fa-spinner fa-spin" aria-hidden="true"></i> {t('Submitting...')}</>
                                    ) : (
                                        <><i className="fa fa-paper-plane" aria-hidden="true"></i> {t('Submit Registration')}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
