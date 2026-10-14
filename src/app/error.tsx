'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import styles from './status.module.css'
import { useT } from '@/i18n/client'

// Shown when a page fails to render. Details stay in the server logs.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const t = useT()
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <main className={styles.main}>
            <div className={styles.card}>
                <div className={styles.code} aria-hidden="true"><i className="fa-solid fa-triangle-exclamation"></i></div>
                <h1>{t('Something went wrong')}</h1>
                <p>
                    {t('This page could not be loaded. Please try again. If the problem continues, contact the club administrator.')}
                    {error.digest ? ` ${t('Reference: {ref}', { ref: error.digest })}` : ''}
                </p>
                <div className={styles.actions}>
                    <button type="button" onClick={reset} className={styles.primary}>
                        <i className="fa-solid fa-rotate-right" aria-hidden="true"></i> {t('Try again')}
                    </button>
                    <Link href="/" className={styles.secondary}>{t('Go to home')}</Link>
                </div>
            </div>
        </main>
    )
}
