'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAsRole } from '@/actions/auth'
import styles from './Header.module.css'

const ROLES = [
    { value: 'ADMIN', label: 'Admin', labelAr: 'أدمن', icon: 'fa-user-shield' },
    { value: 'STUDENT', label: 'Student', labelAr: 'طالب', icon: 'fa-user-graduate' },
    { value: 'STAFF', label: 'Staff', labelAr: 'موظف', icon: 'fa-user-tie' },
]

export default function RoleQuickLogin() {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    async function handleRoleLogin(role: string) {
        setLoading(role)
        const result = await loginAsRole(role)

        if (result?.error) {
            setLoading(null)
        } else {
            router.push(result.redirectTo ?? '/')
            router.refresh()
        }
    }

    return (
        <div className={styles.roleQuickLogin}>
            {ROLES.map(r => (
                <button
                    key={r.value}
                    type="button"
                    className={styles.roleQuickBtn}
                    onClick={() => handleRoleLogin(r.value)}
                    disabled={loading !== null}
                    title={r.labelAr}
                >
                    <i className={loading === r.value ? 'fa fa-spinner fa-spin' : `fa ${r.icon}`}></i>
                    <span>{r.label}</span>
                </button>
            ))}
        </div>
    )
}
