'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './about.module.css'
import { submitClubRegistration } from '@/actions/club'

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
    isLoggedIn: boolean
}

export default function AboutClient({ managementTeam, contactInfo, isLoggedIn }: AboutClientProps) {
    const router = useRouter()
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

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
            setShowForm(false)
            e.currentTarget.reset()
        }
        setLoading(false)
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
                <h2><i className="fa fa-address-book"></i> Contact Us</h2>
                <div className={styles.contactGrid}>
                    <div className={styles.contactCard}>
                        <i className="fa fa-envelope"></i>
                        <h3>Email</h3>
                        <p><a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a></p>
                    </div>
                    <div className={styles.contactCard}>
                        <i className="fa fa-phone"></i>
                        <h3>Phone</h3>
                        <p>{contactInfo.phone}</p>
                    </div>
                    <div className={styles.contactCard}>
                        <i className="fa fa-location-dot"></i>
                        <h3>Location</h3>
                        <p>{contactInfo.location}</p>
                    </div>
                    <div className={styles.contactCard}>
                        <i className="fa fa-clock"></i>
                        <h3>Office Hours</h3>
                        <p>{contactInfo.hours}</p>
                    </div>
                </div>
                <div className={styles.socialLinks}>
                    <a href={`https://instagram.com/${contactInfo.social.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-instagram"></i> {contactInfo.social.instagram}
                    </a>
                    <a href={`https://twitter.com/${contactInfo.social.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-twitter"></i> {contactInfo.social.twitter}
                    </a>
                </div>
            </section>

            {/* Management Hierarchy */}
            <section className={styles.hierarchySection}>
                <h2><i className="fa fa-sitemap"></i> Club Management</h2>

                {/* Hierarchy Tree */}
                <div className={styles.orgChart}>
                    {/* Patron */}
                    <div className={styles.level}>
                        <div className={`${styles.member} ${styles.patron}`}>
                            <div className={styles.avatar}>
                                {managementTeam.patron.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <h3>{managementTeam.patron.name}</h3>
                            <span className={styles.title}>{managementTeam.patron.title}</span>
                            <span className={styles.role}>{managementTeam.patron.role}</span>
                        </div>
                    </div>

                    <div className={styles.connector}></div>

                    {/* Advisor */}
                    <div className={styles.level}>
                        <div className={`${styles.member} ${styles.advisor}`}>
                            <div className={styles.avatar}>
                                {managementTeam.advisor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <h3>{managementTeam.advisor.name}</h3>
                            <span className={styles.title}>{managementTeam.advisor.title}</span>
                            <span className={styles.role}>{managementTeam.advisor.role}</span>
                        </div>
                    </div>

                    <div className={styles.connector}></div>

                    {/* President */}
                    <div className={styles.level}>
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

            {/* Join Section */}
            <section className={styles.joinSection}>
                <div className={styles.joinContent}>
                    <h2>Join AFAQ Innovation Club</h2>
                    <p>Be part of our innovation community and contribute to groundbreaking projects and research.</p>
                    <ul className={styles.benefits}>
                        <li><i className="fa fa-check"></i> Access to innovation labs and equipment</li>
                        <li><i className="fa fa-check"></i> Collaborate on cutting-edge projects</li>
                        <li><i className="fa fa-check"></i> Networking with industry experts</li>
                        <li><i className="fa fa-check"></i> Exclusive workshops and training</li>
                    </ul>
                    <button className={styles.joinBtn} onClick={() => setShowForm(true)}>
                        <i className="fa fa-user-plus"></i> Register Now
                    </button>
                </div>
            </section>

            {/* Success/Error Message */}
            {message.text && (
                <div className={`${styles.toast} ${styles[message.type]}`}>
                    <i className={`fa ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                    {message.text}
                </div>
            )}

            {/* Registration Modal */}
            {showForm && (
                <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Club Registration</h3>
                            <button className={styles.closeBtn} onClick={() => setShowForm(false)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
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
                                        <option value="Engineering">Engineering</option>
                                        <option value="IT & Computing">IT & Computing</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Mechanical">Mechanical</option>
                                        <option value="Civil">Civil</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="yearLevel">Year Level</label>
                                    <select id="yearLevel" name="yearLevel">
                                        <option value="">Select year</option>
                                        <option value="Year 1">Year 1</option>
                                        <option value="Year 2">Year 2</option>
                                        <option value="Year 3">Year 3</option>
                                        <option value="Year 4">Year 4</option>
                                        <option value="Year 5">Year 5</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="interests">Areas of Interest</label>
                                <input
                                    type="text"
                                    id="interests"
                                    name="interests"
                                    placeholder="e.g., AI, Robotics, IoT, Research"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="motivation">Why do you want to join? (Optional)</label>
                                <textarea
                                    id="motivation"
                                    name="motivation"
                                    rows={3}
                                    placeholder="Tell us about your motivation..."
                                ></textarea>
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit Registration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
