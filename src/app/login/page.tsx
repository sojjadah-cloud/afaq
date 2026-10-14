'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loginUser } from '@/actions/auth'
import styles from './page.module.css'
import { useT } from '@/i18n/client'
import LanguageSwitch from '@/components/LanguageSwitch'

function LoginForm() {
    const router = useRouter()
    const t = useT()
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
            setError(t(result.error))
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
                    <i className="fa fa-exclamation-circle" aria-hidden="true"></i> {error}
                </div>
            )}

            <input type="hidden" name="next" value={next} />

            <label className={styles.field}>
                <span>{t('Military ID or email')}</span>
                <div className={styles.inputWrap}>
                    <i className="fa-solid fa-id-card" aria-hidden="true"></i>
                    <input
                        name="militaryId"
                        type="text"
                        autoComplete="username"
                        autoCapitalize="none"
                        spellCheck={false}
                        required
                        placeholder={t('e.g. 2100003')}
                        dir="ltr"
                    />
                </div>
            </label>

            <label className={styles.field}>
                <span>{t('Password')}</span>
                <div className={styles.inputWrap}>
                    <i className="fa-solid fa-lock" aria-hidden="true"></i>
                    <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        placeholder={t('Your password')}
                    />
                    <button
                        type="button"
                        className={styles.toggle}
                        onClick={() => setShowPassword(v => !v)}
                        aria-label={showPassword ? t('Hide password') : t('Show password')}
                    >
                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                    </button>
                </div>
            </label>

            <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? <><i className="fa fa-spinner fa-spin" aria-hidden="true"></i> {t('Signing in...')}</> : <>{t('Sign In')} <i className="fa-solid fa-arrow-right" aria-hidden="true"></i></>}
            </button>

            <p className={styles.help}>
                {t('Forgot your password? Contact the club administrator to reset it.')}
            </p>
        </form>
    )
}

export default function LoginPage() {
    const t = useT()
    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <span className={styles.brandMark} aria-hidden="true">
                    <i className="fa fa-rocket"></i>
                </span>
                {t('AFAQ Innovation')}
            </div>
            <LanguageSwitch className={styles.langBtn} />

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.logo} aria-hidden="true">
                        <i className="fa fa-rocket"></i>
                    </div>
                    <span className={styles.eyebrow}>{t('Secure Sign In')}</span>
                    <h1>{t('Log In to Your Account')}</h1>
                    <p>{t('Sign in with your military ID and password')}</p>
                </div>

                <Suspense>
                    <LoginForm />
                </Suspense>

                <div className={styles.divider}>
                    <span>{t('New to AFAQ?')}</span>
                </div>

                <Link href="/register" className={styles.signupBtn}>
                    <i className="fa fa-user-plus" aria-hidden="true"></i> {t('Create New Account')}
                </Link>
            </div>

            <p className={styles.pageFooter}>© {new Date().getFullYear()} {t('AFAQ Innovation Portal')} · {t('Military Technological College')}</p>
        </div>
    )
}
