'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Nav.module.css'

const navItems = [
    { href: '/', label: 'Home', icon: 'fa-house' },
    { href: '/projects', label: 'Projects', icon: 'fa-lightbulb' },
    { href: '/research', label: 'Research', icon: 'fa-book-open' },
    { href: '/forums', label: 'Forums', icon: 'fa-comments' },
    { href: '/equipment', label: 'Equipment', icon: 'fa-gears' },
    { href: '/events', label: 'Events', icon: 'fa-calendar-days' },
    { href: '/about', label: 'About Us', icon: 'fa-info-circle' },
]

export default function Nav() {
    const pathname = usePathname()

    return (
        <nav className={styles.nav}>
            <ul>
                {navItems.map((item) => (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            className={pathname === item.href ? styles.active : ''}
                        >
                            <i className={`fa ${item.icon}`}></i>
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
