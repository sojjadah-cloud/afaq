'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './about.module.css'
import { submitContactMessage } from '@/actions/contact'

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
    const [contactLoading, setContactLoading] = useState(false)
    const [contactMessage, setContactMessage] = useState({ type: '', text: '' })

    const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setContactLoading(true)
        setContactMessage({ type: '', text: '' })

        const formData = new FormData(e.currentTarget)
        const result = await submitContactMessage(formData)

        if (result.error) {
            setContactMessage({ type: 'error', text: result.error })
        } else {
            setContactMessage({ type: 'success', text: result.message || 'Message sent!' })
            e.currentTarget.reset()
        }
        setContactLoading(false)
    }

    return (
        <main className={styles.main}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>About AFAQ Innovation</h1>
                    <p>Empowering innovation and research at the Military Technological College</p>
                </div>
            </section>

            {/* Contact Section */}
            <section className={styles.contactSection}>
                <div className={styles.sectionHeading}>
                    <h2><i className="fa fa-address-book"></i> Contact Us</h2>
                    <p>Have a question or want to collaborate? Reach out to the AFAQ team.</p>
                </div>

                <div className={styles.contactPanel}>
                    <div className={styles.contactInfoPanel}>
                        <ul className={styles.infoList}>
                            <li>
                                <i className="fa fa-envelope"></i>
                                <div>
                                    <span className={styles.infoLabel}>Email</span>
                                    <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                                </div>
                            </li>
                            <li>
                                <i className="fa fa-phone"></i>
                                <div>
                                    <span className={styles.infoLabel}>Phone</span>
                                    <span>{contactInfo.phone}</span>
                                </div>
                            </li>
                            <li>
                                <i className="fa fa-location-dot"></i>
                                <div>
                                    <span className={styles.infoLabel}>Location</span>
                                    <span>{contactInfo.location}</span>
                                </div>
                            </li>
                            <li>
                                <i className="fa fa-clock"></i>
                                <div>
                                    <span className={styles.infoLabel}>Office Hours</span>
                                    <span>{contactInfo.hours}</span>
                                </div>
                            </li>
                        </ul>

                        <div className={styles.socialLinks}>
                            <a href={`https://instagram.com/${contactInfo.social.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-instagram"></i> {contactInfo.social.instagram}
                            </a>
                            <a href={`https://twitter.com/${contactInfo.social.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-twitter"></i> {contactInfo.social.twitter}
                            </a>
                        </div>
                    </div>

                    <div className={styles.contactFormPanel}>
                        {contactMessage.text && (
                            <div className={`${styles.formMessage} ${styles[contactMessage.type]}`}>
                                <i className={`fa ${contactMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                                {contactMessage.text}
                            </div>
                        )}

                        <form onSubmit={handleContactSubmit} className={styles.form}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="contactName">Full Name *</label>
                                    <input type="text" id="contactName" name="name" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="contactEmail">Email *</label>
                                    <input type="email" id="contactEmail" name="email" required />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="contactSubject">Subject *</label>
                                    <select id="contactSubject" name="subject" required>
                                        <option value="">Select subject</option>
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Project Collaboration">Project Collaboration</option>
                                        <option value="Lab Booking">Lab Booking</option>
                                        <option value="Event Information">Event Information</option>
                                        <option value="Technical Support">Technical Support</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="contactPhone">Phone (optional)</label>
                                    <input type="tel" id="contactPhone" name="phone" />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="contactMessageBody">Message *</label>
                                <textarea id="contactMessageBody" name="message" rows={4} placeholder="How can we help you?" required></textarea>
                            </div>

                            <button type="submit" className={styles.contactSubmitBtn} disabled={contactLoading}>
                                {contactLoading ? (
                                    <><i className="fa fa-spinner fa-spin"></i> Sending...</>
                                ) : (
                                    <><i className="fa fa-paper-plane"></i> Send Message</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Management Hierarchy */}
            <section className={styles.hierarchySection}>
                <div className={styles.sectionHeading}>
                    <h2><i className="fa fa-sitemap"></i> Club Management</h2>
                    <p>Meet the team leading AFAQ Innovation</p>
                </div>

                {/* Hierarchy Tree */}
                <div className={styles.orgChart}>
                    {/* Patron -> Advisor -> Officer (horizontal chain) */}
                    <div className={styles.chainRow}>
                        <div className={`${styles.member} ${styles.patron}`}>
                            <div className={styles.avatar}>
                                {managementTeam.patron.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <h3>{managementTeam.patron.name}</h3>
                            <span className={styles.title}>{managementTeam.patron.title}</span>
                            <span className={styles.role}>{managementTeam.patron.role}</span>
                        </div>

                        <i className={`fa-solid fa-chevron-right ${styles.chainArrow}`}></i>

                        <div className={`${styles.member} ${styles.advisor}`}>
                            <div className={styles.avatar}>
                                {managementTeam.advisor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <h3>{managementTeam.advisor.name}</h3>
                            <span className={styles.title}>{managementTeam.advisor.title}</span>
                            <span className={styles.role}>{managementTeam.advisor.role}</span>
                        </div>

                        <i className={`fa-solid fa-chevron-right ${styles.chainArrow}`}></i>

                        <div className={`${styles.member} ${styles.president}`}>
                            <div className={styles.avatar}>
                                {managementTeam.president.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <h3>{managementTeam.president.name}</h3>
                            <span className={styles.title}>{managementTeam.president.title}</span>
                            <span className={styles.role}>{managementTeam.president.role}</span>
                        </div>
                    </div>

                    <div className={styles.connector}></div>

                    {/* Executives */}
                    <div className={styles.level}>
                        <div className={styles.horizontalBranch}></div>
                        <div className={styles.membersRow}>
                            {managementTeam.executives.map((exec, i) => (
                                <div key={i} className={`${styles.member} ${styles.executive}`}>
                                    <div className={styles.avatar}>
                                        {exec.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <h3>{exec.name}</h3>
                                    <span className={styles.title}>{exec.title}</span>
                                    <span className={styles.role}>{exec.role}</span>
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
                                    <div className={styles.avatar}>
                                        {head.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <h3>{head.name}</h3>
                                    <span className={styles.title}>{head.title}</span>
                                    <span className={styles.role}>{head.role}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Join CTA */}
            <section className={styles.joinCta}>
                <h2>Want to join AFAQ Innovation Club?</h2>
                <p>Register on the home page to get started.</p>
                <Link href="/#join" className={styles.joinBtn}>
                    <i className="fa fa-user-plus"></i> Join the Club
                </Link>
            </section>
        </main>
    )
}
