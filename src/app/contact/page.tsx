'use client'

import { useState } from 'react'
import styles from './contact.module.css'
import { submitContactMessage } from '@/actions/contact'

export default function ContactPage() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        const formData = new FormData(e.currentTarget)
        const result = await submitContactMessage(formData)

        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: result.message || 'Message sent!' })
            e.currentTarget.reset()
        }
        setLoading(false)
    }

    const contactInfo = {
        email: 'afaq.innovation@mtc.edu.om',
        phone: '+968 2441 2345',
        location: 'Building A, Room 105, Military Technological College, Al Khoudh',
        hours: 'Sunday - Thursday: 08:00 - 16:00'
    }

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h1>Contact Us</h1>
                <p>Get in touch with the AFAQ Innovation team</p>
            </div>

            <div className={styles.content}>
                {/* Contact Info */}
                <div className={styles.infoSection}>
                    <h2>Get in Touch</h2>
                    <p>Have questions about AFAQ Innovation? We&apos;d love to hear from you.</p>

                    <div className={styles.infoCards}>
                        <div className={styles.infoCard}>
                            <i className="fa fa-envelope"></i>
                            <h3>Email</h3>
                            <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                        </div>
                        <div className={styles.infoCard}>
                            <i className="fa fa-phone"></i>
                            <h3>Phone</h3>
                            <p>{contactInfo.phone}</p>
                        </div>
                        <div className={styles.infoCard}>
                            <i className="fa fa-location-dot"></i>
                            <h3>Location</h3>
                            <p>{contactInfo.location}</p>
                        </div>
                        <div className={styles.infoCard}>
                            <i className="fa fa-clock"></i>
                            <h3>Office Hours</h3>
                            <p>{contactInfo.hours}</p>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className={styles.formSection}>
                    <h2>Send us a Message</h2>

                    {message.text && (
                        <div className={`${styles.formMessage} ${styles[message.type]}`}>
                            <i className={`fa ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Full Name *</label>
                                <input type="text" id="name" name="name" required />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email *</label>
                                <input type="email" id="email" name="email" required />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="phone">Phone (optional)</label>
                                <input type="tel" id="phone" name="phone" />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="subject">Subject *</label>
                                <select id="subject" name="subject" required>
                                    <option value="">Select subject</option>
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Project Collaboration">Project Collaboration</option>
                                    <option value="Lab Booking">Lab Booking</option>
                                    <option value="Event Information">Event Information</option>
                                    <option value="Technical Support">Technical Support</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="message">Message *</label>
                            <textarea
                                id="message"
                                name="message"
                                rows={5}
                                placeholder="How can we help you?"
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? (
                                <><i className="fa fa-spinner fa-spin"></i> Sending...</>
                            ) : (
                                <><i className="fa fa-paper-plane"></i> Send Message</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    )
}
