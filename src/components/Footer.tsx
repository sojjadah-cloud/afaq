import Link from 'next/link'
import styles from './Footer.module.css'
import { getT } from '@/i18n/server'

const LINKS = [
    { href: '/projects', label: 'Projects' },
    { href: '/events', label: 'Events' },
    { href: '/equipment', label: 'Workshops & Tools' },
    { href: '/news', label: 'News' },
    { href: '/research', label: 'Research' },
    { href: '/forums', label: 'Forums' },
    { href: '/about', label: 'About & Contact' },
]

export default async function Footer() {
    const { t } = await getT()
    return (
        <footer className={styles.footer}>
            <div className={styles.brandRow}>
                <span className={styles.brandMark} aria-hidden="true">
                    <i className="fa fa-rocket"></i>
                </span>
                <span className={styles.brandName}>{t('AFAQ Innovation Portal')}</span>
            </div>
            <nav aria-label={t('Footer')}>
                <ul className={styles.links}>
                    {LINKS.map(l => (
                        <li key={l.href}><Link href={l.href}>{t(l.label)}</Link></li>
                    ))}
                </ul>
            </nav>
            <p className={styles.tagline}>
                {t('Sultanate of Oman')} &ndash; {t('Ministry of Defence')} &middot; {t('Military Technological College')}
            </p>
        </footer>
    )
}
