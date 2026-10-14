import Link from 'next/link'
import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import { getProjectSections } from '@/lib/sections'
import { STAGES, StageKey } from './stages'
import styles from './project-list.module.css'
import { getT } from '@/i18n/server'

export default async function StageSections({ stage }: { stage: StageKey }) {
    const { t } = await getT()
    const config = STAGES[stage]
    const sections = await getProjectSections()
    const placeholders = config.statuses.map(() => '?').join(', ')
    const counts = await query<RowDataPacket[]>(
        `SELECT departmentId, COUNT(*) as count FROM projects WHERE status IN (${placeholders}) GROUP BY departmentId`,
        [...config.statuses]
    )
    const countFor = (departmentId: string | null) =>
        Number(counts.find(c => (c.departmentId ?? null) === departmentId)?.count) || 0
    const total = counts.reduce((sum, c) => sum + Number(c.count), 0)

    return (
        <main className={styles.main}>
            <div className={styles.pageHeader}>
                <Link href="/projects" className={styles.backLink}>
                    <i className="fa fa-arrow-left" aria-hidden="true"></i> {t('Back to Projects')}
                </Link>
                <h2>{t(config.title)}</h2>
                <p>{t(config.desc)}</p>
                <span className={styles.headerCount} style={{ color: config.color, background: config.bg }}>
                    {t('{n} projects across {s} sections', { n: total, s: sections.length })}
                </span>
            </div>

            <h3 className={styles.sectionHeading}>{t('Choose a department')}</h3>
            <div className={styles.sectionGrid}>
                {sections.map(section => {
                    const count = countFor(section.departmentId)
                    return (
                        <Link
                            key={section.slug}
                            href={`/projects/${stage}/${section.slug}`}
                            className={`${styles.sectionCard} ${count === 0 ? styles.sectionCardEmpty : ''}`}
                        >
                            <div className={styles.sectionIcon} style={{ color: config.color, background: config.bg }} aria-hidden="true">
                                <i className={`fa-solid ${section.icon}`}></i>
                            </div>
                            <div className={styles.sectionText}>
                                <div className={styles.sectionName}>{t(section.name)}</div>
                                <div className={styles.sectionDesc}>{t(section.description)}</div>
                            </div>
                            <div className={styles.sectionCount}>
                                <strong>{count}</strong>
                                <span>{t(count === 1 ? 'project' : 'projects')}</span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </main>
    )
}
