import Link from 'next/link'
import styles from './page.module.css'

export default function HomePage() {
    const heroSlides = [
        {
            title: "Induction Week 2025/2026",
            text: "A strategic start for AFAQ members to connect, collaborate, and transform ideas into innovation impact."
        },
        {
            title: "AFAQ Innovation Tracks",
            text: "Cybersecurity, IoT, AI, Sustainability and Smart Logistics – structured tracks that convert ideas into deployable solutions."
        },
        {
            title: "From Prototype to Impact",
            text: "AFAQ supports teams with mentoring, equipment access and exhibition opportunities so that promising ideas go beyond the lab."
        }
    ]

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>AFAQ Innovation Portal</h1>
                    <p className={styles.visionStatement}>
                        "A strategic start for AFAQ members to connect, collaborate, and transform ideas into innovation impact."
                    </p>
                </div>
            </section>

            <section className={styles.features}>
                {heroSlides.slice(1).map((slide, index) => (
                    <div key={index} className={`${styles.featureCard} ${styles[`animateDelay${index + 1}`]}`}>
                        <h3>{slide.title}</h3>
                        <p>{slide.text}</p>
                    </div>
                ))}
            </section>

            <section className={`${styles.iconGrid} ${styles.animateDelay3}`}>
                <Link href="/projects" className={styles.iconCard}>
                    <div className={styles.iconCircle}>
                        <i className="fa-solid fa-lightbulb"></i>
                    </div>
                    <div className={styles.iconTitle}>Innovation Projects</div>
                </Link>

                <Link href="/research" className={styles.iconCard}>
                    <div className={styles.iconCircle}>
                        <i className="fa-solid fa-flask"></i>
                    </div>
                    <div className={styles.iconTitle}>Research Hub</div>
                </Link>

                <Link href="/equipment" className={styles.iconCard}>
                    <div className={styles.iconCircle}>
                        <i className="fa-solid fa-gears"></i>
                    </div>
                    <div className={styles.iconTitle}>Lab Equipment</div>
                </Link>

                <Link href="/events" className={styles.iconCard}>
                    <div className={styles.iconCircle}>
                        <i className="fa-solid fa-calendar-days"></i>
                    </div>
                    <div className={styles.iconTitle}>Innovation Events</div>
                </Link>
            </section>
        </main>
    )
}
