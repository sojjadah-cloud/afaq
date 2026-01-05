'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginUser } from '@/actions/auth'
import styles from './page.module.css'

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const result = await loginUser(formData)

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
                    <p>Military Technological College Innovation Platform</p>

                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <i className="fa fa-lightbulb"></i>
                            <span>Showcase Projects</span>
                        </div>
                        <div className={styles.feature}>
                            <i className="fa fa-flask"></i>
                            <span>Book Lab Sessions</span>
                        </div>
                        <div className={styles.feature}>
                            <i className="fa fa-users"></i>
                            <span>Collaborate with Peers</span>
                        </div>
                        <div className={styles.feature}>
                            <i className="fa fa-calendar"></i>
                            <span>Join Events</span>
                        </div>
                    </div>
                </div>
                <div className={styles.brandingFooter}>
                    <p>© 2026 MTC AFAQ Innovation Portal</p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className={styles.formSide}>
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <h2>Welcome Back</h2>
                        <p>Sign in to continue to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
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
                            <label htmlFor="password">
                                <i className="fa fa-lock"></i> Password
                            </label>
                            <div className={styles.passwordInput}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
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

                        {error && (
                            <div className={styles.error}>
                                <i className="fa fa-exclamation-circle"></i> {error}
                            </div>
                        )}

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? (
                                <><i className="fa fa-spinner fa-spin"></i> Signing in...</>
                            ) : (
                                <><i className="fa fa-sign-in-alt"></i> Sign In</>
                            )}
                        </button>
                    </form>

                    <div className={styles.divider}>
                        <span>or</span>
                    </div>

                    <Link href="/register" className={styles.signupBtn}>
                        <i className="fa fa-user-plus"></i> Create New Account
                    </Link>

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
