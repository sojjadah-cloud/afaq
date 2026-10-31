import Link from 'next/link'
import { COURSE_FIELDS, COURSE_KINDS, isCourseField, isCourseKind, parseVideo } from '@/lib/courses'
import type { TFunction } from '@/i18n/core'
import styles from './courses.module.css'

export interface CourseRow {
    id: string
    title: string
    kind: string
    field: string
    summary: string
    videoUrl: string
    instructor: string | null
    duration: string | null
}

export default function CourseCard({ course, t, showField = true }: { course: CourseRow; t: TFunction; showField?: boolean }) {
    const video = parseVideo(course.videoUrl)
    const kind = COURSE_KINDS[isCourseKind(course.kind) ? course.kind : 'COURSE']
    const field = COURSE_FIELDS[isCourseField(course.field) ? course.field : 'OTHER']

    return (
        <Link href={`/courses/${course.id}`} className={styles.courseCard}>
            <div className={styles.thumb} aria-hidden="true">
                {video?.thumbnail
                    ? <img src={video.thumbnail} alt="" loading="lazy" />
                    : <i className={`fa-brands ${video?.provider === 'drive' ? 'fa-google-drive' : 'fa-youtube'}`}></i>}
                <span className={styles.playBadge}><i className="fa-solid fa-play"></i></span>
            </div>
            <div className={styles.courseBody}>
                <div className={styles.badges}>
                    <span className={styles.badge}><i className={`fa-solid ${kind.icon}`} aria-hidden="true"></i> {t(kind.label)}</span>
                    {showField && (
                        <span className={styles.badge} style={{ color: field.color, background: field.bg }}>
                            <i className={`fa-solid ${field.icon}`} aria-hidden="true"></i> {t(field.label)}
                        </span>
                    )}
                </div>
                <h3>{course.title}</h3>
                <p className={styles.excerpt}>{course.summary}</p>
                {(course.instructor || course.duration) && (
                    <div className={styles.courseMeta}>
                        {course.instructor && <span><i className="fa-solid fa-chalkboard-user" aria-hidden="true"></i> {course.instructor}</span>}
                        {course.duration && <span><i className="fa-regular fa-clock" aria-hidden="true"></i> {course.duration}</span>}
                    </div>
                )}
            </div>
        </Link>
    )
}
