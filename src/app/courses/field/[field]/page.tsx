import Link from 'next/link'
import { notFound } from 'next/navigation'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { getT } from '@/i18n/server'
import { COURSE_FIELDS, COURSE_KINDS, isCourseField, isCourseKind } from '@/lib/courses'
import CourseCard, { CourseRow } from '../../CourseCard'
import { AddCourseButton } from '../../CourseControls'
import styles from '../../courses.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ field: string }> }) {
    const { field } = await params
    const { t } = await getT()
    const key = field.toUpperCase()
    return { title: isCourseField(key) ? `${t(COURSE_FIELDS[key].label)} | ${t('Courses & Workshops')}` : t('Courses & Workshops') }
}

export default async function CourseFieldPage({ params, searchParams }: {
    params: Promise<{ field: string }>
    searchParams: Promise<{ kind?: string }>
}) {
    const { field } = await params
    const { kind: kindParam } = await searchParams
    const key = field.toUpperCase()
    if (!isCourseField(key)) notFound()
    const kind = isCourseKind(kindParam) ? kindParam : null

    const session = await getSession()
    const { t } = await getT()
    const canManage = session.role === 'STAFF' || session.role === 'ADMIN'
    const meta = COURSE_FIELDS[key]

    const courses = await query<CourseRow[]>(
        `SELECT id, title, kind, field, summary, videoUrl, instructor, duration FROM courses
         WHERE field = ? ${kind ? 'AND kind = ?' : ''} ORDER BY createdAt DESC`,
        kind ? [key, kind] : [key]
    )
    const base = `/courses/field/${field.toLowerCase()}`

    return (
        <main className={styles.main}>
            <Link href="/courses" className={styles.backLink}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> {t('Back to {name}', { name: t('Courses & Workshops') })}
            </Link>

            <div className={styles.header}>
                <span className={styles.fieldIcon} style={{ color: meta.color, background: meta.bg, margin: '0 auto 1rem' }} aria-hidden="true">
                    <i className={`fa-solid ${meta.icon}`}></i>
                </span>
                <h2>{t(meta.label)}</h2>
                <p>{t('{n} courses and workshops in this field', { n: courses.length })}</p>
                {canManage && (
                    <div className={styles.headerActions}>
                        <AddCourseButton field={key} />
                    </div>
                )}
            </div>

            <nav className={styles.filterBar} aria-label={t('Filter')}>
                {([null, 'COURSE', 'WORKSHOP'] as const).map(k => (
                    <Link
                        key={k || 'all'}
                        href={k ? `${base}?kind=${k}` : base}
                        className={`${styles.filterBtn} ${kind === k ? styles.filterActive : ''}`}
                        aria-current={kind === k ? 'page' : undefined}
                    >
                        {k ? t(COURSE_KINDS[k].label) : t('All')}
                    </Link>
                ))}
            </nav>

            {courses.length === 0 ? (
                <div className={styles.empty}>
                    <i className={`fa-solid ${meta.icon}`} aria-hidden="true"></i>
                    {t('Nothing in this field yet.')}
                </div>
            ) : (
                <div className={styles.courseGrid}>
                    {courses.map(course => <CourseCard key={course.id} course={course} t={t} showField={false} />)}
                </div>
            )}
        </main>
    )
}
