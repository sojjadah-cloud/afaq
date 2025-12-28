import Link from 'next/link'
import styles from './page.module.css'

export default function ResearchPage() {
    const researchAreas = [
        {
            title: "Data Integration",
            category: "Infrastructure",
            description: "Connect your database to display publications, theses, and ongoing research projects automatically.",
            icon: "fa-database"
        },
        {
            title: "Publications",
            category: "Academic Output",
            description: "Browse peer-reviewed papers, articles, and conference proceedings from AFAQ researchers.",
            icon: "fa-scroll"
        },
        {
            title: "Thesis Records",
            category: "Student Work",
            description: "Archive of master's theses and doctoral dissertations with full-text access.",
            icon: "fa-graduation-cap"
        }
    ]

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>Research Hub</h2>
                <p>Academic research, publications, and ongoing scholarly work within AFAQ.</p>
            </div>

            <div className={styles.grid}>
                {researchAreas.map((area, index) => (
                    <div key={index} className={`${styles.card} ${styles[`animateDelay${index + 1}`]}`}>
                        <div className={styles.cardContent}>
                            <div className={styles.category}>{area.category}</div>
                            <h3>{area.title}</h3>
                            <p>{area.description}</p>
                            <Link href="#" className={styles.readMore}>
                                Learn more <i className="fa-solid fa-arrow-right"></i>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}
