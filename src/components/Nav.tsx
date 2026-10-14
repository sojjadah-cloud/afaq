'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Nav.module.css'
import { useT } from '@/i18n/client'

const navItems = [
    { href: '/', label: 'Home', icon: 'fa-house' },
    { href: '/projects', label: 'Projects', icon: 'fa-lightbulb' },
    { href: '/research', label: 'Research', icon: 'fa-book-open' },
    { href: '/forums', label: 'Forums', icon: 'fa-comments' },
    { href: '/equipment', label: 'Equipment', icon: 'fa-gears' },
    { href: '/events', label: 'Events', icon: 'fa-calendar-days' },
    { href: '/news', label: 'News', icon: 'fa-newspaper' },
    { href: '/about', label: 'About Us', icon: 'fa-info-circle' },
]

export default function Nav() {
    const pathname = usePathname()
    const t = useT()

    return (
        <nav className={styles.nav} aria-label={t('Main')}>
            <ul>
                {navItems.map((item) => (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            className={pathname === item.href ? styles.active : ''}
                            aria-current={pathname === item.href ? 'page' : undefined}
                        >
                            <i className={`fa ${item.icon}`} aria-hidden="true"></i>
                            {t(item.label)}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
