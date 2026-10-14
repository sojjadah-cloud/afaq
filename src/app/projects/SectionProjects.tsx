import Link from 'next/link'
import { notFound } from 'next/navigation'
import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import { getProjectSection } from '@/lib/sections'
import { stripMarkdown } from '@/lib/utils'
import { STAGES, StageKey, STATUS_LABELS } from './stages'
import styles from './project-list.module.css'
import { getT } from '@/i18n/server'

export default async function SectionProjects({ stage, sectionSlug }: { stage: StageKey; sectionSlug: string }) {
    const { t } = await getT()
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
                    <i className="fa fa-arrow-left" aria-hidden="true"></i> {t('Back to {name}', { name: t(config.title) })}
                </Link>
                <div className={styles.breadcrumb}>{t(config.title)}</div>
                <h2>{t(section.name)}</h2>
                <p>{t(section.description)}</p>
                <span className={styles.headerCount} style={{ color: config.color, background: config.bg }}>
                    {t('{n} projects', { n: projects.length })}
                </span>
            </div>

            {projects.length === 0 ? (
                <div className={styles.emptyPanel}>
                    <i className={`fa-solid ${section.icon}`} aria-hidden="true"></i>
                    <p>{t('No projects in this stage for {name} yet.', { name: t(section.name) })}</p>
                    {stage === 'start' && (
                        <Link href={`/projects?new=1&section=${section.slug}`} className={styles.emptyAction}>
                            <i className="fa fa-plus" aria-hidden="true"></i> {t('Submit a project for this section')}
                        </Link>
                    )}
                </div>
            ) : (
                <div className={styles.projectsGrid}>
                    {projects.map(project => (
                        <Link key={project.id} href={`/projects/${project.id}`} className={`${styles.projectCard} ${styles.projectLink}`} style={{ borderTop: `4px solid ${config.color}` }}>
                            <div className={styles.projectHeader}>
                                <span className={styles.projectCategory}>{t(project.category)}</span>
                                <span className={styles.statusLabel} style={{ color: config.color, background: config.bg }}>
                                    {t(STATUS_LABELS[project.status] || project.status)}
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
                                <span><i className="fa fa-user" aria-hidden="true"></i> {project.ownerName}</span>
                                <span><i className="fa fa-users" aria-hidden="true"></i> {Number(project.memberCount) === 1 ? t('1 member') : t('{n} members', { n: project.memberCount })}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    )
}
