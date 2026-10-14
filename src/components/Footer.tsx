import Link from 'next/link'
import styles from './Footer.module.css'

const LINKS = [
    { href: '/projects', label: 'Projects' },
    { href: '/events', label: 'Events' },
    { href: '/equipment', label: 'Workshops & Tools' },
    { href: '/news', label: 'News' },
    { href: '/research', label: 'Research' },
    { href: '/forums', label: 'Forums' },
    { href: '/about', label: 'About & Contact' },
]

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.brandRow}>
                <span className={styles.brandMark} aria-hidden="true">
                    <i className="fa fa-rocket"></i>
                </span>
                <span className={styles.brandName}>AFAQ Innovation Portal</span>
            </div>
            <nav aria-label="Footer">
                <ul className={styles.links}>
                    {LINKS.map(l => (
                        <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
                    ))}
                </ul>
            </nav>
            <p className={styles.tagline}>
                Sultanate of Oman &ndash; Ministry of Defence &middot; Military Technological College
            </p>
        </footer>
    )
}
