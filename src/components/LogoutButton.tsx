'use client'

import { logoutUser } from '@/actions/auth'
import styles from './Header.module.css'
import { useT } from '@/i18n/client'

export default function LogoutButton() {
    const t = useT()
    return (
        <button
            type="button"
            onClick={() => logoutUser()}
            className={styles.logoutBtn}
            title={t('Log out')}
            aria-label={t('Log out')}
        >
            <i className="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
        </button>
    )
}
