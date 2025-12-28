'use client'

import { loginUser } from '@/actions/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import styles from './page.module.css'

export default function LoginForm() {
    const router = useRouter()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const result = await loginUser(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            router.push('/')
            router.refresh()
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="militaryId">Military ID / الرقم العسكري</label>
            <input
                type="text"
                id="militaryId"
                name="militaryId"
                placeholder="2101006"
                required
            />

            <label htmlFor="password">Password / كلمة المرور</label>
            <input
                type="password"
                id="password"
                name="password"
                required
            />

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.btnLogin} disabled={loading}>
                {loading ? 'Logging in...' : 'Log in'}
            </button>

            <div className={styles.linkRow}>
                <a href="#">Lost password?</a>
            </div>

            <hr />

            <button type="button" className={styles.btnCookies}>
                Cookies notice
            </button>
        </form>
    )
}
