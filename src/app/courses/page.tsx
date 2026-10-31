import Link from 'next/link'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { RowDataPacket } from '@/lib/types'
import { pageTitle } from '@/lib/metadata'
import { getT } from '@/i18n/server'
import { COURSE_FIELDS, COURSE_FIELD_KEYS, COURSE_KINDS, isCourseKind } from '@/lib/courses'
import CourseCard, { CourseRow } from './CourseCard'
import { AddCourseButton } from './CourseControls'
import styles from './courses.module.css'

export const generateMetadata = () => pageTitle('Courses & Workshops')
export const dynamic = 'force-dynamic'

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
    const { kind: kindParam } = await searchParams
    const kind = isCourseKind(kindParam) ? kindParam : null
    const session = await getSession()
    const { t } = await getT()
    const canManage = session.role === 'STAFF' || session.role === 'ADMIN'
    const plural = (n: number, one: string, many: string) => (n === 1 ? t(one) : t(many, { n }))

    const counts = await query<RowDataPacket[]>('SELECT field, kind, COUNT(*) as count FROM courses GROUP BY field, kind')
    const countFor = (field?: string, k?: string | null) =>
        counts.filter(c => (!field || c.field === field) && (!k || c.kind === k)).reduce((sum, c) => sum + Number(c.count), 0)

    const latest = await query<CourseRow[]>(
        `SELECT id, title, kind, field, summary, videoUrl, instructor, duration FROM courses
         ${kind ? 'WHERE kind = ?' : ''} ORDER BY createdAt DESC LIMIT 6`,
        kind ? [kind] : []
    )

    const filters = [
        { key: null, label: 'All', icon: 'fa-layer-group' },
        { key: 'COURSE', label: COURSE_KINDS.COURSE.label, icon: COURSE_KINDS.COURSE.icon },
        { key: 'WORKSHOP', label: COURSE_KINDS.WORKSHOP.label, icon: COURSE_KINDS.WORKSHOP.icon },
    ] as const

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>{t('Courses & Workshops')}</h2>
                <p>{t('Recorded courses and workshops grouped by field. Open one to read the overview and watch the video.')}</p>
                {canManage && (
                    <div className={styles.headerActions}>
                        <AddCourseButton />
                    </div>
                )}
            </div>

            <nav className={styles.filterBar} aria-label={t('Filter')}>
                {filters.map(f => {
                    const active = kind === f.key
                    return (
                        <Link
                            key={f.label}
                            href={f.key ? `/courses?kind=${f.key}` : '/courses'}
                            className={`${styles.filterBtn} ${active ? styles.filterActive : ''}`}
                            aria-current={active ? 'page' : undefined}
                        >
                            <i className={`fa-solid ${f.icon}`} aria-hidden="true"></i> {t(f.label)}
                            <span className={styles.filterCount}>({countFor(undefined, f.key)})</span>
                        </Link>
                    )
                })}
            </nav>

            <div className={styles.fieldGrid}>
                {COURSE_FIELD_KEYS.map(key => {
                    const meta = COURSE_FIELDS[key]
                    const total = countFor(key, kind)
                    return (
                        <Link
                            key={key}
                            href={`/courses/field/${key.toLowerCase()}${kind ? `?kind=${kind}` : ''}`}
                            className={`${styles.fieldCard} ${total === 0 ? styles.fieldCardEmpty : ''}`}
                        >
                            <span className={styles.fieldIcon} style={{ color: meta.color, background: meta.bg }} aria-hidden="true">
                                <i className={`fa-solid ${meta.icon}`}></i>
                            </span>
                            <h3>{t(meta.label)}</h3>
                            <div className={styles.fieldMeta}>
                                <span>{plural(countFor(key, 'COURSE'), '1 course', '{n} courses')}</span>
                                <span>{plural(countFor(key, 'WORKSHOP'), '1 workshop', '{n} workshops')}</span>
                            </div>
                        </Link>
                    )
                })}
            </div>

            <h3 style={{ margin: '2.5rem 0 1rem', color: '#1e293b', fontSize: '1.3rem' }}>{t('Latest additions')}</h3>
            {latest.length === 0 ? (
                <div className={styles.empty}>
                    <i className="fa-solid fa-photo-film" aria-hidden="true"></i>
                    {t('No courses or workshops yet.')}
                </div>
            ) : (
                <div className={styles.courseGrid}>
                    {latest.map(course => <CourseCard key={course.id} course={course} t={t} />)}
                </div>
            )}
        </main>
    )
}
