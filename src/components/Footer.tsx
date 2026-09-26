import styles from './Footer.module.css'

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.brandRow}>
                <span className={styles.brandMark}>
                    <i className="fa fa-rocket"></i>
                </span>
                <span className={styles.brandName}>AFAQ Innovation Portal</span>
            </div>
            <p className={styles.tagline}>
                Sultanate of Oman &ndash; Ministry of Defence &middot; Military Technological College
            </p>
        </footer>
    )
}
