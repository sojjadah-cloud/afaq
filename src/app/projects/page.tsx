import { query } from '@/lib/db'
import Link from 'next/link'
import styles from './page.module.css'
import { RowDataPacket } from 'mysql2'

interface CountResult extends RowDataPacket {
    count: number
}

export default async function ProjectsPage() {
    const startResult = await query<CountResult[]>('SELECT COUNT(*) as count FROM projects WHERE status = ?', ['START'])
    const devResult = await query<CountResult[]>('SELECT COUNT(*) as count FROM projects WHERE status = ?', ['DEVELOPMENT'])
    const completedResult = await query<CountResult[]>('SELECT COUNT(*) as count FROM projects WHERE status = ?', ['COMPLETED'])

    const projectCounts = {
        start: startResult[0].count,
        development: devResult[0].count,
        completed: completedResult[0].count,
    }

    return (
        <main className={styles.main}>
            <div className={styles.pageHeader}>
                <h2>Innovation Projects</h2>
                <p>
                    Browse projects by stage: new ideas (Start), active development, or completed innovations.
                </p>
            </div>

            <section className={styles.statusGrid}>
                <Link href="/projects/start" className={`${styles.statusCard} animate-delay-1`}>
                    <div className={styles.statusIcon}>
                        <i className="fa-solid fa-rocket"></i>
                    </div>
                    <div className={styles.statusTitle}>Start</div>
                    <div className={styles.statusCount}>{projectCounts.start} projects</div>
                    <div className={styles.statusDesc}>New ideas and early-stage concepts</div>
                </Link>

                <Link href="/projects/development" className={`${styles.statusCard} animate-delay-2`}>
                    <div className={styles.statusIcon} style={{ borderColor: '#4A90E2' }}>
                        <i className="fa-solid fa-code" style={{ color: '#4A90E2' }}></i>
                    </div>
                    <div className={styles.statusTitle}>In Development</div>
                    <div className={styles.statusCount}>{projectCounts.development} projects</div>
                    <div className={styles.statusDesc}>Active projects under construction</div>
                </Link>

                <Link href="/projects/completed" className={`${styles.statusCard} animate-delay-3`}>
                    <div className={styles.statusIcon} style={{ borderColor: '#50C878' }}>
                        <i className="fa-solid fa-check-circle" style={{ color: '#50C878' }}></i>
                    </div>
                    <div className={styles.statusTitle}>Completed</div>
                    <div className={styles.statusCount}>{projectCounts.completed} projects</div>
                    <div className={styles.statusDesc}>Finished and documented innovations</div>
                </Link>
            </section>
        </main>
    )
}
