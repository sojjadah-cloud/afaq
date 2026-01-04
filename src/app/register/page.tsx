'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerUser } from '@/actions/auth'
import styles from '../login/page.module.css'

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const result = await registerUser(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            router.push('/')
            router.refresh()
        }
    }

    return (
        <div className={styles.container}>
            {/* Left Side - Branding */}
            <div className={styles.brandingSide}>
                <div className={styles.brandingContent}>
                    <div className={styles.logo}>
                        <i className="fa fa-rocket"></i>
                    </div>
                    <h1>AFAQ Innovation</h1>
                    <p>Join the Military Technological College Innovation Community</p>

                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <i className="fa fa-graduation-cap"></i>
                            <span>Student Access</span>
                        </div>
                        <div className={styles.feature}>
                            <i className="fa fa-project-diagram"></i>
                            <span>Create Projects</span>
                        </div>
                        <div className={styles.feature}>
                            <i className="fa fa-comments"></i>
                            <span>Join Discussions</span>
                        </div>
                        <div className={styles.feature}>
                            <i className="fa fa-trophy"></i>
                            <span>Earn Recognition</span>
                        </div>
                    </div>
                </div>
                <div className={styles.brandingFooter}>
                    <p>© 2026 MTC AFAQ Innovation Portal</p>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className={styles.formSide}>
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <h2>Create Account</h2>
                        <p>Register to access the innovation portal</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="fullName">
                                <i className="fa fa-user"></i> Full Name
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                placeholder="Enter your full name"
                                required
                                autoComplete="name"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="militaryId">
                                <i className="fa fa-id-card"></i> Military ID
                            </label>
                            <input
                                type="text"
                                id="militaryId"
                                name="militaryId"
                                placeholder="Enter your military ID"
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email">
                                <i className="fa fa-envelope"></i> Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email address"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">
                                <i className="fa fa-lock"></i> Password
                            </label>
                            <div className={styles.passwordInput}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    placeholder="Create a password (min 6 chars)"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className={styles.togglePassword}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">
                                <i className="fa fa-lock"></i> Confirm Password
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                required
                                minLength={6}
                                autoComplete="new-password"
                            />
                        </div>

                        {error && (
                            <div className={styles.error}>
                                <i className="fa fa-exclamation-circle"></i> {error}
                            </div>
                        )}

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? (
                                <><i className="fa fa-spinner fa-spin"></i> Creating Account...</>
                            ) : (
                                <><i className="fa fa-user-plus"></i> Create Account</>
                            )}
                        </button>

                        <div className={styles.divider}>
                            <span>or</span>
                        </div>

                        <Link href="/login" className={styles.signupBtn}>
                            <i className="fa fa-sign-in-alt"></i> Already have an account? Sign In
                        </Link>
                    </form>

                    <div className={styles.formFooter}>
                        <Link href="/" className={styles.backLink}>
                            <i className="fa fa-arrow-left"></i> Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
