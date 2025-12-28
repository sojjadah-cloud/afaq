import LoginForm from './LoginForm'
import styles from './page.module.css'

export default function LoginPage() {
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.portalHeader}>
                <h1>AFAQ Innovation Portal</h1>
                <p>Military Technological College – Internal Innovation Access</p>
            </div>

            <div className={styles.loginCard}>
                <LoginForm />
            </div>
        </div>
    )
}
