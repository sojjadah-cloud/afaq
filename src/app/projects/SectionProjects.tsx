import Link from 'next/link'
import { notFound } from 'next/navigation'
import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import { getProjectSection } from '@/lib/sections'
import { stripMarkdown } from '@/lib/utils'
import { STAGES, StageKey, STATUS_LABELS } from './stages'
import styles from './project-list.module.css'

export default async function SectionProjects({ stage, sectionSlug }: { stage: StageKey; sectionSlug: string }) {
    const config = STAGES[stage]
    const section = await getProjectSection(sectionSlug)
    if (!section) notFound()

    const placeholders = config.statuses.map(() => '?').join(', ')
    const departmentFilter = section.departmentId === null ? 'p.departmentId IS NULL' : 'p.departmentId = ?'
    const projects = await query<RowDataPacket[]>(
        `SELECT p.id, p.title, p.description, p.category, p.status, p.progress, p.createdAt,
                COALESCE(sp.fullName, u.email) as ownerName,
                (SELECT COUNT(*) FROM project_members pm WHERE pm.projectId = p.id AND pm.status = 'APPROVED') as memberCount
         FROM projects p
         LEFT JOIN users u ON u.id = p.createdById
         LEFT JOIN student_profiles sp ON sp.userId = p.createdById
         WHERE p.status IN (${placeholders}) AND ${departmentFilter}
         ORDER BY p.updatedAt DESC`,
        section.departmentId === null ? [...config.statuses] : [...config.statuses, section.departmentId]
    )

    return (
        <main className={styles.main}>
            <div className={styles.pageHeader}>
                <Link href={`/projects/${stage}`} className={styles.backLink}>
                    <i className="fa fa-arrow-left"></i> Back to {config.title}
                </Link>
                <div className={styles.breadcrumb}>{config.title}</div>
                <h2>{section.name}</h2>
                <p>{section.description}</p>
                <span className={styles.headerCount} style={{ color: config.color, background: config.bg }}>
                    {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                </span>
            </div>

            {projects.length === 0 ? (
                <div className={styles.emptyPanel}>
                    <i className={`fa-solid ${section.icon}`}></i>
                    <p>No {config.title.toLowerCase()} in {section.name} yet.</p>
                    {stage === 'start' && (
                        <Link href={`/projects?new=1&section=${section.slug}`} className={styles.emptyAction}>
                            <i className="fa fa-plus"></i> Submit a project for this section
                        </Link>
                    )}
                </div>
            ) : (
                <div className={styles.projectsGrid}>
                    {projects.map(project => (
                        <Link key={project.id} href={`/projects/${project.id}`} className={`${styles.projectCard} ${styles.projectLink}`} style={{ borderTop: `4px solid ${config.color}` }}>
                            <div className={styles.projectHeader}>
                                <span className={styles.projectCategory}>{project.category}</span>
                                <span className={styles.statusLabel} style={{ color: config.color, background: config.bg }}>
                                    {STATUS_LABELS[project.status] || project.status}
                                </span>
                            </div>
                            <h3 className={styles.projectTitle}>{project.title}</h3>
                            <p className={styles.projectDesc}>{stripMarkdown(project.description)}</p>
                            <div className={styles.progressRow}>
                                <div className={styles.progressTrack}>
                                    <div style={{ width: `${Number(project.progress) || 0}%`, background: config.color }}></div>
                                </div>
                                <span>{Number(project.progress) || 0}%</span>
                            </div>
                            <div className={styles.projectMeta}>
                                <span><i className="fa fa-user"></i> {project.ownerName}</span>
                                <span><i className="fa fa-users"></i> {project.memberCount} {Number(project.memberCount) === 1 ? 'member' : 'members'}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    )
}
