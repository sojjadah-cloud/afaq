'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginAsRole } from '@/actions/auth'
import styles from './page.module.css'

// TEMPORARY: choose a role instead of entering credentials
const ROLES = [
    { value: 'STUDENT', label: 'Student', labelAr: 'طالب', icon: 'fa-user-graduate' },
    { value: 'STAFF', label: 'Staff', labelAr: 'موظف', icon: 'fa-user-tie' },
    { value: 'ADMIN', label: 'Admin', labelAr: 'أدمن', icon: 'fa-user-shield' },
]

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState<string | null>(null)

    async function handleRoleLogin(role: string) {
        setError('')
        setLoading(role)

        const result = await loginAsRole(role)

        if (result?.error) {
            setError(result.error)
            setLoading(null)
        } else {
            router.push(result.redirectTo ?? '/')
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

                    <div className={styles.form}>
                        <div className={styles.roleGrid}>
                            {ROLES.map(r => (
                                <button
                                    key={r.value}
                                    type="button"
                                    className={styles.roleBtn}
                                    onClick={() => handleRoleLogin(r.value)}
                                    disabled={loading !== null}
                                >
                                    <i className={loading === r.value ? 'fa fa-spinner fa-spin' : `fa ${r.icon}`}></i>
                                    <span>{r.label}</span>
                                    <small>{r.labelAr}</small>
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className={styles.error}>
                                <i className="fa fa-exclamation-circle"></i> {error}
                            </div>
                        )}
                    </div>

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
