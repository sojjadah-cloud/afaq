'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import { submitClubRegistration } from '@/actions/club'

export default function HomePage() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const formRef = useRef<HTMLFormElement>(null)

    const heroSlides = [
        {
            title: "Induction Week 2025/2026",
            text: "A strategic start for AFAQ members to connect, collaborate, and transform ideas into innovation impact."
        },
        {
            title: "AFAQ Innovation Tracks",
            text: "Cybersecurity, IoT, AI, Sustainability and Smart Logistics – structured tracks that convert ideas into deployable solutions."
        },
        {
            title: "From Prototype to Impact",
            text: "AFAQ supports teams with mentoring, equipment access and exhibition opportunities so that promising ideas go beyond the lab."
        }
    ]

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
        }
        setLoading(false)
    }

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>AFAQ Innovation Portal</h1>
                    <p className={styles.visionStatement}>
                        "A strategic start for AFAQ members to connect, collaborate, and transform ideas into innovation impact."
                    </p>
                </div>
            </section>

            <section className={styles.features}>
                {heroSlides.slice(1).map((slide, index) => (
                    <div key={index} className={`${styles.featureCard} ${styles[`animateDelay${index + 1}`]}`}>
                        <h3>{slide.title}</h3>
                        <p>{slide.text}</p>
                    </div>
                ))}
            </section>

            <section className={`${styles.iconGrid} ${styles.animateDelay3}`}>
                <Link href="/projects" className={styles.iconCard}>
                    <div className={styles.iconCircle}>
                        <i className="fa-solid fa-lightbulb"></i>
                    </div>
                    <div className={styles.iconTitle}>Innovation Projects</div>
                </Link>

                <Link href="/research" className={styles.iconCard}>
                    <div className={styles.iconCircle}>
                        <i className="fa-solid fa-flask"></i>
                    </div>
                    <div className={styles.iconTitle}>Research Hub</div>
                </Link>

                <Link href="/equipment" className={styles.iconCard}>
                    <div className={styles.iconCircle}>
                        <i className="fa-solid fa-gears"></i>
                    </div>
                    <div className={styles.iconTitle}>Lab Equipment</div>
                </Link>

                <Link href="/events" className={styles.iconCard}>
                    <div className={styles.iconCircle}>
                        <i className="fa-solid fa-calendar-days"></i>
                    </div>
                    <div className={styles.iconTitle}>Innovation Events</div>
                </Link>
            </section>

            {/* Registration Section */}
            <section className={styles.registerSection}>
                <div className={styles.registerContent}>
                    <div className={styles.registerInfo}>
                        <h2><i className="fa fa-user-plus"></i> Join AFAQ Innovation Club</h2>
                        <p>Be part of our innovation community and contribute to groundbreaking projects and research.</p>
                        <ul className={styles.benefits}>
                            <li><i className="fa fa-check"></i> Access to innovation labs and equipment</li>
                            <li><i className="fa fa-check"></i> Collaborate on cutting-edge projects</li>
                            <li><i className="fa fa-check"></i> Networking with industry experts</li>
                            <li><i className="fa fa-check"></i> Exclusive workshops and training</li>
                        </ul>
                    </div>

                    <div className={styles.registerForm}>
                        <h3>Register Now</h3>

                        {message.text && (
                            <div className={`${styles.formMessage} ${styles[message.type]}`}>
                                <i className={`fa ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                                {message.text}
                            </div>
                        )}

                        <form ref={formRef} onSubmit={handleSubmit}>
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
                                        <option value="Aeronautical Engineering">Aeronautical Engineering</option>
                                        <option value="Systems Engineering">Systems Engineering</option>
                                        <option value="Marin Engineering">Marin Engineering</option>
                                        <option value="Civil Engineering">Civil Engineering</option>
                                        <option value="Foundation Department">Foundation Department</option>
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
                                        <option value="Year 6">Year 6</option>
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
                                <label htmlFor="motivation">Why do you want to join?</label>
                                <textarea
                                    id="motivation"
                                    name="motivation"
                                    rows={3}
                                    placeholder="Tell us about your motivation..."
                                ></textarea>
                            </div>

                            <button type="submit" className={styles.registerBtn} disabled={loading}>
                                {loading ? (
                                    <><i className="fa fa-spinner fa-spin"></i> Submitting...</>
                                ) : (
                                    <><i className="fa fa-paper-plane"></i> Submit Registration</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    )
}
