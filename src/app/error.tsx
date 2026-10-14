'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import styles from './status.module.css'

// Shown when a page fails to render. Details stay in the server logs.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <main className={styles.main}>
            <div className={styles.card}>
                <div className={styles.code} aria-hidden="true"><i className="fa-solid fa-triangle-exclamation"></i></div>
                <h1>Something went wrong</h1>
                <p>
                    This page could not be loaded. Please try again. If the problem continues, contact the club administrator
                    {error.digest ? ` and mention reference ${error.digest}` : ''}.
                </p>
                <div className={styles.actions}>
                    <button type="button" onClick={reset} className={styles.primary}>
                        <i className="fa-solid fa-rotate-right" aria-hidden="true"></i> Try again
                    </button>
                    <Link href="/" className={styles.secondary}>Go to home</Link>
                </div>
            </div>
        </main>
    )
}
