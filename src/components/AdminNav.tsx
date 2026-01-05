'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from '../app/admin/admin.module.css'

const adminNavItems = [
    { href: '/admin', label: 'Overview', icon: 'fa-chart-simple', exact: true },
    { href: '/admin/bookings', label: 'Bookings', icon: 'fa-calendar-check' },
    { href: '/admin/projects', label: 'Projects', icon: 'fa-lightbulb' },
    { href: '/admin/requests', label: 'Requests', icon: 'fa-inbox' },
    { href: '/admin/events', label: 'Events', icon: 'fa-calendar-days' },
    { href: '/admin/analytics', label: 'Analytics', icon: 'fa-chart-pie' },
    { href: '/admin/audit', label: 'Audit Log', icon: 'fa-clipboard-list' },
]

export default function AdminNav() {
    const pathname = usePathname()

    const isActive = (item: typeof adminNavItems[0]) => {
        if (item.exact) {
            return pathname === item.href
        }
        return pathname === item.href || pathname.startsWith(item.href + '/')
    }

    return (
        <div className={styles.adminNav}>
            {adminNavItems.map(item => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navLink} ${isActive(item) ? styles.active : ''}`}
                >
                    <i className={`fa ${item.icon}`}></i> {item.label}
                </Link>
            ))}
        </div>
    )
}
