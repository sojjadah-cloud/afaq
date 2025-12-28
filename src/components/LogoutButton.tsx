'use client'

import { logoutUser } from '@/actions/auth'
import styles from './Header.module.css'

export default function LogoutButton() {
    return (
        <button
            onClick={() => logoutUser()}
            className={styles.logoutBtn}
            title="Logout"
        >
            <i className="fa-solid fa-right-from-bracket"></i>
        </button>
    )
}
