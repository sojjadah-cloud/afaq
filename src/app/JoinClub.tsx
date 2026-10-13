'use client'

import { useState, useRef } from 'react'
import styles from './page.module.css'
import { submitClubRegistration } from '@/actions/club'

export default function JoinClub({ departments }: { departments: string[] }) {
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const formRef = useRef<HTMLFormElement>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        const formData = new FormData(e.currentTarget)
        const result = await submitClubRegistration(formData)

        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: result.message || 'Registration submitted!' })
            formRef.current?.reset()
            setShowForm(false)
        }
        setLoading(false)
    }

    return (
        <>
            <section id="join" className={styles.registerSection}>
                <div className={styles.registerCta}>
                    <div className={styles.registerCtaIcon}>
                        <i className="fa fa-user-plus"></i>
                    </div>
                    <div className={styles.registerCtaText}>
                        <h2>Join the Scientific Club</h2>
                        <p>Be part of our innovation community and contribute to groundbreaking projects and research.</p>
                    </div>
                    <button className={styles.registerCtaBtn} onClick={() => setShowForm(true)}>
                        <i className="fa fa-paper-plane"></i> Register Now
                    </button>
                </div>
            </section>

            {message.text && (
                <div className={`${styles.toast} ${styles[message.type]}`}>
                    <i className={`fa ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                    {message.text}
                </div>
            )}

            {showForm && (
                <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Join the Scientific Club</h3>
                            <button className={styles.closeBtn} onClick={() => setShowForm(false)} aria-label="Close">
                                <i className="fa fa-times"></i>
                            </button>
                        </div>

                        <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
                            <ul className={styles.modalBenefits}>
                                <li><i className="fa fa-check"></i> Access to innovation labs and equipment</li>
                                <li><i className="fa fa-check"></i> Collaborate on cutting-edge projects</li>
                                <li><i className="fa fa-check"></i> Networking with industry experts</li>
                                <li><i className="fa fa-check"></i> Exclusive workshops and training</li>
                            </ul>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="fullName">Full Name *</label>
                                    <input type="text" id="fullName" name="fullName" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="militaryId">Military ID *</label>
                                    <input type="text" id="militaryId" name="militaryId" required />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="email">Email *</label>
                                    <input type="email" id="email" name="email" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="phone">Phone</label>
                                    <input type="tel" id="phone" name="phone" />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="department">Department *</label>
                                    <select id="department" name="department" required>
                                        <option value="">Select department</option>
                                        {departments.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="yearLevel">Year Level</label>
                                    <select id="yearLevel" name="yearLevel">
                                        <option value="">Select year</option>
                                        <option value="Level 1">Level 1</option>
                                        <option value="Level 2">Level 2</option>
                                        <option value="Level 3">Level 3</option>
                                        <option value="Level 4">Level 4</option>
                                        <option value="Graduate">Graduate</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="interests">Areas of Interest</label>
                                <input
                                    type="text"
                                    id="interests"
                                    name="interests"
                                    placeholder="e.g., Cybersecurity, IoT, AI, Robotics"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="motivation">Why do you want to join?</label>
                                <textarea
                                    id="motivation"
                                    name="motivation"
                                    rows={3}
                                    placeholder="Tell us about your motivation..."
                                ></textarea>
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setShowForm(false)} disabled={loading}>Cancel</button>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? (
                                        <><i className="fa fa-spinner fa-spin"></i> Submitting...</>
                                    ) : (
                                        <><i className="fa fa-paper-plane"></i> Submit Registration</>
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
