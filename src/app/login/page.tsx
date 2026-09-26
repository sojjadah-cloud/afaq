'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginAsRole } from '@/actions/auth'
import styles from './page.module.css'

// TEMPORARY: choose a role instead of entering credentials
const ROLES = [
    { value: 'STUDENT', label: 'Student', labelAr: 'طالب', desc: 'Browse projects, book equipment and join events', icon: 'fa-user-graduate' },
    { value: 'STAFF', label: 'Staff', labelAr: 'موظف', desc: 'Manage labs, review submissions and mentor teams', icon: 'fa-user-tie' },
    { value: 'ADMIN', label: 'Admin', labelAr: 'أدمن', desc: 'Full control over the innovation portal', icon: 'fa-user-shield' },
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
        <div className={styles.page}>
            <div className={styles.topBar}>
                <span className={styles.brandMark}>
                    <i className="fa fa-rocket"></i>
                </span>
                AFAQ Innovation
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.logo}>
                        <i className="fa fa-rocket"></i>
                    </div>
                    <span className={styles.eyebrow}>Secure Sign In</span>
                    <h1>Log In to Your Account</h1>
                    <p>Choose your role to continue to AFAQ Innovation Portal</p>
                </div>

                {error && (
                    <div className={styles.error}>
                        <i className="fa fa-exclamation-circle"></i> {error}
                    </div>
                )}

                <div className={styles.roleList} role="list">
                    {ROLES.map(r => (
                        <button
                            key={r.value}
                            type="button"
                            className={styles.roleRow}
                            onClick={() => handleRoleLogin(r.value)}
                            disabled={loading !== null}
                        >
                            <span className={styles.roleIcon}>
                                <i className={loading === r.value ? 'fa fa-spinner fa-spin' : `fa ${r.icon}`}></i>
                            </span>
                            <span className={styles.roleText}>
                                <strong>{r.label}</strong>
                                <span>{r.desc}</span>
                            </span>
                            <i className={`fa fa-chevron-right ${styles.chevron}`}></i>
                        </button>
                    ))}
                </div>

                <div className={styles.divider}>
                    <span>or</span>
                </div>

                <Link href="/register" className={styles.signupBtn}>
                    <i className="fa fa-user-plus"></i> Create New Account
                </Link>
            </div>

            <p className={styles.pageFooter}>© 2026 MTC AFAQ Innovation Portal · Military Technological College</p>
        </div>
    )
}
