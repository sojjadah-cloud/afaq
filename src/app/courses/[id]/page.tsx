import Link from 'next/link'
import { notFound } from 'next/navigation'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { recordTitle } from '@/lib/metadata'
import { getT } from '@/i18n/server'
import { COURSE_FIELDS, COURSE_KINDS, isCourseField, isCourseKind, parseVideo } from '@/lib/courses'
import type { CourseRow } from '../CourseCard'
import { ManageCourse } from '../CourseControls'
import styles from '../courses.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return recordTitle('SELECT title, titleAr FROM courses WHERE id = ?', id, 'Courses & Workshops')
}

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const rows = await query<CourseRow[]>(
        'SELECT id, title, kind, field, summary, videoUrl, instructor, duration FROM courses WHERE id = ?',
        [id]
    )
    const course = rows[0]
    if (!course) notFound()

    const session = await getSession()
    const { t } = await getT()
    const canManage = session.role === 'STAFF' || session.role === 'ADMIN'
    const fieldKey = isCourseField(course.field) ? course.field : 'OTHER'
    const field = COURSE_FIELDS[fieldKey]
    const kind = COURSE_KINDS[isCourseKind(course.kind) ? course.kind : 'COURSE']
    const video = parseVideo(course.videoUrl)

    return (
        <main className={styles.main}>
            <Link href={`/courses/field/${fieldKey.toLowerCase()}`} className={styles.backLink}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> {t('Back to {name}', { name: t(field.label) })}
            </Link>

            <div className={styles.detail}>
                <article className={styles.detailCard}>
                    <div className={styles.badges}>
                        <span className={styles.badge}><i className={`fa-solid ${kind.icon}`} aria-hidden="true"></i> {t(kind.label)}</span>
                        <span className={styles.badge} style={{ color: field.color, background: field.bg }}>
                            <i className={`fa-solid ${field.icon}`} aria-hidden="true"></i> {t(field.label)}
                        </span>
                    </div>
                    <h1 dir="auto">{course.title}</h1>
                    {(course.instructor || course.duration) && (
                        <div className={styles.detailMeta}>
                            {course.instructor && <span><i className="fa-solid fa-chalkboard-user" aria-hidden="true"></i> {t('Presenter')}: <span dir="auto">{course.instructor}</span></span>}
                            {course.duration && <span><i className="fa-regular fa-clock" aria-hidden="true"></i> {t('Duration')}: {course.duration}</span>}
                        </div>
                    )}
                </article>

                <section className={styles.detailCard} aria-labelledby="overview-title">
                    <h2 id="overview-title">{t('About this course')}</h2>
                    <p className={styles.summary} dir="auto">{course.summary}</p>
                </section>

                <section className={styles.detailCard} aria-labelledby="video-title">
                    <h2 id="video-title">{t('Video')}</h2>
                    {video ? (
                        <>
                            <div className={styles.player}>
                                <iframe
                                    src={video.embedUrl}
                                    title={course.title}
                                    loading="lazy"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <div className={styles.videoActions}>
                                <small>
                                    {video.provider === 'drive'
                                        ? t('If the video does not play, the file may not be shared publicly on Google Drive.')
                                        : t('Playing from YouTube.')}
                                </small>
                                <a href={video.watchUrl} target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn}>
                                    <i className={`fa-brands ${video.provider === 'drive' ? 'fa-google-drive' : 'fa-youtube'}`} aria-hidden="true"></i>
                                    {video.provider === 'drive' ? t('Open in Google Drive') : t('Open on YouTube')}
                                    <span className="sr-only">{t('(opens in a new tab)')}</span>
                                </a>
                            </div>
                        </>
                    ) : (
                        <p className={styles.summary}>{t('The video link for this entry is not valid. Ask a staff member to update it.')}</p>
                    )}

                    {canManage && (
                        <ManageCourse course={{
                            id: course.id, title: course.title, kind: course.kind, field: course.field, summary: course.summary,
                            videoUrl: course.videoUrl, instructor: course.instructor || '', duration: course.duration || '',
                        }} />
                    )}
                </section>
            </div>
        </main>
    )
}
