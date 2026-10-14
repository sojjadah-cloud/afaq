'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './about.module.css'
import { submitContactMessage } from '@/actions/contact'
import { initials } from '@/lib/utils'
import { useT } from '@/i18n/client'

interface ManagementTeam {
    patron: { name: string; title: string; role: string; image: string | null }
    advisor: { name: string; title: string; role: string; image: string | null }
    president: { name: string; title: string; role: string; image: string | null }
    executives: { name: string; title: string; role: string }[]
    heads: { name: string; title: string; role: string }[]
}

interface ContactInfo {
    email: string
    phone: string
    location: string
    hours: string
    social: { instagram: string; twitter: string }
}

interface AboutClientProps {
    managementTeam: ManagementTeam
    contactInfo: ContactInfo
}

export default function AboutClient({ managementTeam, contactInfo }: AboutClientProps) {
    const t = useT()
    const [contactLoading, setContactLoading] = useState(false)
    const [contactMessage, setContactMessage] = useState({ type: '', text: '' })

    const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setContactLoading(true)
        setContactMessage({ type: '', text: '' })

        // Keep the form element: React clears e.currentTarget once the handler awaits.
        const form = e.currentTarget
        const result = await submitContactMessage(new FormData(form)).catch(() => ({ error: 'Something went wrong. Please try again.', message: '' }))

        if (result.error) {
            setContactMessage({ type: 'error', text: t(result.error) })
        } else {
            setContactMessage({ type: 'success', text: t(result.message || 'Message sent!') })
            form.reset()
        }
        setContactLoading(false)
    }

    return (
        <main className={styles.main}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>{t('About AFAQ Innovation')}</h1>
                    <p>{t('Empowering innovation and research at the Military Technological College')}</p>
                </div>
            </section>

            {/* Contact Section */}
            <section className={styles.contactSection}>
                <div className={styles.sectionHeading}>
                    <h2><i className="fa fa-address-book" aria-hidden="true"></i> {t('Contact Us')}</h2>
                    <p>{t('Have a question or want to collaborate? Reach out to the AFAQ team.')}</p>
                </div>

                <div className={styles.contactPanel}>
                    <div className={styles.contactInfoPanel}>
                        <ul className={styles.infoList}>
                            <li>
                                <i className="fa fa-envelope" aria-hidden="true"></i>
                                <div>
                                    <span className={styles.infoLabel}>{t('Email')}</span>
                                    <a href={`mailto:${contactInfo.email}`} dir="ltr">{contactInfo.email}</a>
                                </div>
                            </li>
                            <li>
                                <i className="fa fa-phone" aria-hidden="true"></i>
                                <div>
                                    <span className={styles.infoLabel}>{t('Phone')}</span>
                                    <span dir="ltr">{contactInfo.phone}</span>
                                </div>
                            </li>
                            <li>
                                <i className="fa fa-location-dot" aria-hidden="true"></i>
                                <div>
                                    <span className={styles.infoLabel}>{t('Location')}</span>
                                    <span>{t(contactInfo.location)}</span>
                                </div>
                            </li>
                            <li>
                                <i className="fa fa-clock" aria-hidden="true"></i>
                                <div>
                                    <span className={styles.infoLabel}>{t('Office Hours')}</span>
                                    <span>{t(contactInfo.hours)}</span>
                                </div>
                            </li>
                        </ul>

                        <div className={styles.socialLinks}>
                            <a href={`https://instagram.com/${contactInfo.social.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-instagram" aria-hidden="true"></i> <span dir="ltr">{contactInfo.social.instagram}</span>
                            </a>
                            <a href={`https://twitter.com/${contactInfo.social.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-twitter" aria-hidden="true"></i> <span dir="ltr">{contactInfo.social.twitter}</span>
                            </a>
                        </div>
                    </div>

                    <div className={styles.contactFormPanel}>
                        {contactMessage.text && (
                            <div className={`${styles.formMessage} ${styles[contactMessage.type]}`} role={contactMessage.type === 'error' ? 'alert' : 'status'}>
                                <i className={`fa ${contactMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} aria-hidden="true"></i>
                                {contactMessage.text}
                            </div>
                        )}

                        <form onSubmit={handleContactSubmit} className={styles.form}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="contactName">{t('Full Name')} *</label>
                                    <input type="text" id="contactName" name="name" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="contactEmail">{t('Email')} *</label>
                                    <input type="email" id="contactEmail" name="email" required />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="contactSubject">{t('Subject')} *</label>
                                    <select id="contactSubject" name="subject" required>
                                        <option value="">{t('Select subject')}</option>
                                        {['General Inquiry', 'Project Collaboration', 'Lab Booking', 'Event Information', 'Technical Support', 'Other'].map(s => (
                                            <option key={s} value={s}>{t(s)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="contactPhone">{t('Phone (optional)')}</label>
                                    <input type="tel" id="contactPhone" name="phone" />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="contactMessageBody">{t('Message')} *</label>
                                <textarea id="contactMessageBody" name="message" rows={4} placeholder={t('How can we help you?')} required></textarea>
                            </div>

                            <button type="submit" className={styles.contactSubmitBtn} disabled={contactLoading}>
                                {contactLoading ? (
                                    <><i className="fa fa-spinner fa-spin" aria-hidden="true"></i> {t('Sending...')}</>
                                ) : (
                                    <><i className="fa fa-paper-plane" aria-hidden="true"></i> {t('Send Message')}</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Management Hierarchy */}
            <section className={styles.hierarchySection}>
                <div className={styles.sectionHeading}>
                    <h2><i className="fa fa-sitemap" aria-hidden="true"></i> {t('Club Management')}</h2>
                    <p>{t('Meet the team leading AFAQ Innovation')}</p>
                </div>

                {/* Hierarchy Tree */}
                <div className={styles.orgChart}>
                    {/* Patron -> Advisor -> Officer (horizontal chain) */}
                    <div className={styles.chainRow}>
                        <div className={`${styles.member} ${styles.patron}`}>
                            <div className={styles.avatar} aria-hidden="true">
                                {initials(managementTeam.patron.name)}
                            </div>
                            <h3>{managementTeam.patron.name}</h3>
                            <span className={styles.title}>{t(managementTeam.patron.title)}</span>
                            <span className={styles.role}>{t(managementTeam.patron.role)}</span>
                        </div>

                        <i className={`fa-solid fa-chevron-right ${styles.chainArrow}`} aria-hidden="true"></i>

                        <div className={`${styles.member} ${styles.advisor}`}>
                            <div className={styles.avatar} aria-hidden="true">
                                {initials(managementTeam.advisor.name)}
                            </div>
                            <h3>{managementTeam.advisor.name}</h3>
                            <span className={styles.title}>{t(managementTeam.advisor.title)}</span>
                            <span className={styles.role}>{t(managementTeam.advisor.role)}</span>
                        </div>

                        <i className={`fa-solid fa-chevron-right ${styles.chainArrow}`} aria-hidden="true"></i>

                        <div className={`${styles.member} ${styles.president}`}>
                            <div className={styles.avatar} aria-hidden="true">
                                {initials(managementTeam.president.name)}
                            </div>
                            <h3>{managementTeam.president.name}</h3>
                            <span className={styles.title}>{t(managementTeam.president.title)}</span>
                            <span className={styles.role}>{t(managementTeam.president.role)}</span>
                        </div>
                    </div>

                    <div className={styles.connector}></div>

                    {/* Executives */}
                    <div className={styles.level}>
                        <div className={styles.horizontalBranch}></div>
                        <div className={styles.membersRow}>
                            {managementTeam.executives.map((exec, i) => (
                                <div key={i} className={`${styles.member} ${styles.executive}`}>
                                    <div className={styles.avatar} aria-hidden="true">
                                        {initials(t(exec.name))}
                                    </div>
                                    <h3>{t(exec.name)}</h3>
                                    <span className={styles.title}>{t(exec.title)}</span>
                                    <span className={styles.role}>{t(exec.role)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.connector}></div>

                    {/* Department Heads */}
                    <div className={styles.level}>
                        <div className={styles.horizontalBranch}></div>
                        <div className={styles.membersRow}>
                            {managementTeam.heads.map((head, i) => (
                                <div key={i} className={`${styles.member} ${styles.head}`}>
                                    <div className={styles.avatar} aria-hidden="true">
                                        {initials(t(head.name))}
                                    </div>
                                    <h3>{t(head.name)}</h3>
                                    <span className={styles.title}>{t(head.title)}</span>
                                    <span className={styles.role}>{t(head.role)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Join CTA */}
            <section className={styles.joinCta}>
                <h2>{t('Want to join AFAQ Innovation Club?')}</h2>
                <p>{t('Register on the home page to get started.')}</p>
                <Link href="/#join" className={styles.joinBtn}>
                    <i className="fa fa-user-plus" aria-hidden="true"></i> {t('Join the Club')}
                </Link>
            </section>
        </main>
    )
}
