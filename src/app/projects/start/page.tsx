import { query } from '@/lib/db'
import Link from 'next/link'
import styles from '../project-list.module.css'
import { RowDataPacket } from 'mysql2'
import { stripMarkdown } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Project extends RowDataPacket {
    id: string
    title: string
    description: string
    category: string
    progress: number
    createdAt: Date
    memberCount: number
}

export default async function StartProjectsPage() {
    const projects = await query<Project[]>(`
    SELECT
      p.*,
      (SELECT COUNT(*) FROM project_members pm WHERE pm.projectId = p.id) as memberCount
    FROM projects p
    WHERE p.status IN ('START', 'PENDING_APPROVAL')
    ORDER BY p.createdAt DESC
  `)

    return (
        <main className={styles.main}>
            <div className={styles.pageHeader}>
                <Link href="/projects" className={styles.backLink}>
                    <i className="fa fa-arrow-left"></i> Back to Projects
                </Link>
                <h2>Start Projects</h2>
                <p>New ideas and early-stage concepts waiting to take shape.</p>
            </div>

            <div className={styles.projectsGrid}>
                {projects.length === 0 ? (
                    <p className={styles.emptyState}>No projects in this stage yet.</p>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className={styles.projectCard}>
                            <div className={styles.projectHeader}>
                                <span className={styles.projectCategory}>{project.category}</span>
                                <span className={styles.projectProgress}>{project.progress}%</span>
                            </div>
                            <Link href={`/projects/${project.id}`} className={styles.projectLink}>
                                <h3 className={styles.projectTitle}>{project.title}</h3>
                            </Link>
                            <p className={styles.projectDesc}>{stripMarkdown(project.description)}</p>
                            <div className={styles.projectMeta}>
                                <span>
                                    <i className="fa fa-users"></i> {project.memberCount + 1} members
                                </span>
                                <span>
                                    <i className="fa fa-calendar"></i> {new Date(project.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    )
}
