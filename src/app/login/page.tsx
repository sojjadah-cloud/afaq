'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loginUser } from '@/actions/auth'
import styles from './page.module.css'

function LoginForm() {
    const router = useRouter()
    const next = useSearchParams().get('next') || ''
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setLoading(true)
        const result = await loginUser(new FormData(e.currentTarget))
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            router.push(result.redirectTo ?? '/')
            router.refresh()
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {error && (
                <div className={styles.error} role="alert">
                    <i className="fa fa-exclamation-circle"></i> {error}
                </div>
            )}

            <input type="hidden" name="next" value={next} />

            <label className={styles.field}>
                <span>Military ID or email</span>
                <div className={styles.inputWrap}>
                    <i className="fa-solid fa-id-card"></i>
                    <input
                        name="militaryId"
                        type="text"
                        autoComplete="username"
                        autoCapitalize="none"
                        spellCheck={false}
                        required
                        placeholder="e.g. 2100003"
                    />
                </div>
            </label>

            <label className={styles.field}>
                <span>Password</span>
                <div className={styles.inputWrap}>
                    <i className="fa-solid fa-lock"></i>
                    <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        placeholder="Your password"
                    />
                    <button
                        type="button"
                        className={styles.toggle}
                        onClick={() => setShowPassword(v => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                </div>
            </label>

            <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? <><i className="fa fa-spinner fa-spin"></i> Signing in...</> : <>Sign In <i className="fa-solid fa-arrow-right"></i></>}
            </button>

            <p className={styles.help}>
                Forgot your password? Contact the club administrator to reset it.
            </p>
        </form>
    )
}

export default function LoginPage() {
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
                    <p>Sign in with your military ID and password</p>
                </div>

                <Suspense>
                    <LoginForm />
                </Suspense>

                <div className={styles.divider}>
                    <span>New to AFAQ?</span>
                </div>

                <Link href="/register" className={styles.signupBtn}>
                    <i className="fa fa-user-plus"></i> Create New Account
                </Link>
            </div>

            <p className={styles.pageFooter}>© 2026 MTC AFAQ Innovation Portal · Military Technological College</p>
        </div>
    )
}
