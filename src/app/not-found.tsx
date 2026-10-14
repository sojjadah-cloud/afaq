import Link from 'next/link'
import styles from './status.module.css'

export const metadata = { title: 'Page not found' }

export default function NotFound() {
    return (
        <main className={styles.main}>
            <div className={styles.card}>
                <div className={styles.code} aria-hidden="true"><i className="fa-solid fa-compass"></i></div>
                <h1>Page not found</h1>
                <p>The page you are looking for does not exist or may have been removed. Check the address, or use the links below.</p>
                <div className={styles.actions}>
                    <Link href="/" className={styles.primary}><i className="fa-solid fa-house" aria-hidden="true"></i> Go to home</Link>
                    <Link href="/projects" className={styles.secondary}>Projects</Link>
                    <Link href="/events" className={styles.secondary}>Events</Link>
                </div>
            </div>
        </main>
    )
}
