import Link from 'next/link'
import styles from './status.module.css'
import { pageTitle } from '@/lib/metadata'
import { getT } from '@/i18n/server'

export const generateMetadata = () => pageTitle('Page not found')

export default async function NotFound() {
    const { t } = await getT()
    return (
        <main className={styles.main}>
            <div className={styles.card}>
                <div className={styles.code} aria-hidden="true"><i className="fa-solid fa-compass"></i></div>
                <h1>{t('Page not found')}</h1>
                <p>{t('The page you are looking for does not exist or may have been removed. Check the address, or use the links below.')}</p>
                <div className={styles.actions}>
                    <Link href="/" className={styles.primary}><i className="fa-solid fa-house" aria-hidden="true"></i> {t('Go to home')}</Link>
                    <Link href="/projects" className={styles.secondary}>{t('Projects')}</Link>
                    <Link href="/events" className={styles.secondary}>{t('Events')}</Link>
                </div>
            </div>
        </main>
    )
}
