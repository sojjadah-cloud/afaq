'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveCourse, deleteCourse } from '@/actions/courses'
import { COURSE_FIELDS, COURSE_FIELD_KEYS, COURSE_KINDS, CourseField, parseVideo } from '@/lib/courses'
import { useT } from '@/i18n/client'
import styles from './courses.module.css'

export interface CourseFormValues {
    id?: string
    title?: string
    kind?: string
    field?: string
    summary?: string
    videoUrl?: string
    instructor?: string
    duration?: string
}

function CourseDialog({ initial, onClose }: { initial: CourseFormValues; onClose: () => void }) {
    const t = useT()
    const router = useRouter()
    const [videoUrl, setVideoUrl] = useState(initial.videoUrl || '')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const video = videoUrl.trim() ? parseVideo(videoUrl) : null

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setBusy(true)
        const result = await saveCourse(new FormData(e.currentTarget)).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        setBusy(false)
        if ('error' in result && result.error) {
            setError(t(result.error))
            return
        }
        onClose()
        if (!initial.id && 'id' in result && result.id) router.push(`/courses/${result.id}`)
        else router.refresh()
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="course-form-title" onClick={e => e.stopPropagation()}>
                <div className={styles.dialogHead}>
                    <h3 id="course-form-title">{initial.id ? t('Edit course or workshop') : t('Add a course or workshop')}</h3>
                    <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t('Close')}>
                        <i className="fa fa-times" aria-hidden="true"></i>
                    </button>
                </div>
                <form onSubmit={submit} className={styles.form}>
                    <input type="hidden" name="id" value={initial.id || ''} />
                    <label className={styles.field}>
                        <span>{t('Title')} *</span>
                        <input name="title" required maxLength={200} defaultValue={initial.title} />
                    </label>
                    <div className={styles.row}>
                        <label className={styles.field}>
                            <span>{t('Type')} *</span>
                            <select name="kind" required defaultValue={initial.kind || 'COURSE'}>
                                {Object.entries(COURSE_KINDS).map(([key, meta]) => <option key={key} value={key}>{t(meta.label)}</option>)}
                            </select>
                        </label>
                        <label className={styles.field}>
                            <span>{t('Field')} *</span>
                            <select name="field" required defaultValue={initial.field || ''}>
                                <option value="">{t('Select...')}</option>
                                {COURSE_FIELD_KEYS.map(key => <option key={key} value={key}>{t(COURSE_FIELDS[key].label)}</option>)}
                            </select>
                        </label>
                    </div>
                    <label className={styles.field}>
                        <span>{t('Brief overview')} *</span>
                        <textarea name="summary" rows={5} required maxLength={5000} defaultValue={initial.summary} placeholder={t('What the course covers, who it is for and what participants will be able to do')} />
                    </label>
                    <label className={styles.field}>
                        <span>{t('Video link')} *</span>
                        <input name="videoUrl" type="url" required maxLength={500} value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtu.be/..." dir="ltr" />
                        <small>{t('YouTube or Google Drive. For Google Drive, share the file with "Anyone with the link".')}</small>
                        {videoUrl.trim() && (
                            <span className={`${styles.preview} ${video ? styles.previewOk : styles.previewBad}`} aria-live="polite">
                                <i className={`fa-solid ${video ? 'fa-circle-check' : 'fa-circle-exclamation'}`} aria-hidden="true"></i>
                                {video ? (video.provider === 'youtube' ? t('YouTube video recognised') : t('Google Drive video recognised')) : t('Use a YouTube or Google Drive video link')}
                            </span>
                        )}
                    </label>
                    <div className={styles.row}>
                        <label className={styles.field}>
                            <span>{t('Presenter')}</span>
                            <input name="instructor" maxLength={120} defaultValue={initial.instructor} />
                        </label>
                        <label className={styles.field}>
                            <span>{t('Duration')}</span>
                            <input name="duration" maxLength={60} defaultValue={initial.duration} placeholder={t('e.g. 45 minutes')} />
                        </label>
                    </div>
                    {error && <div className={styles.formError} role="alert">{error}</div>}
                    <div className={styles.formActions}>
                        <button type="button" className={styles.secondaryBtn} onClick={onClose} disabled={busy}>{t('Cancel')}</button>
                        <button type="submit" className={styles.primaryBtn} disabled={busy}>{busy ? t('Saving...') : t('Save')}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export function AddCourseButton({ field }: { field?: CourseField }) {
    const t = useT()
    const [open, setOpen] = useState(false)
    return (
        <>
            <button type="button" className={styles.primaryBtn} onClick={() => setOpen(true)}>
                <i className="fa-solid fa-plus" aria-hidden="true"></i> {t('Add a course or workshop')}
            </button>
            {open && <CourseDialog initial={{ field }} onClose={() => setOpen(false)} />}
        </>
    )
}

export function ManageCourse({ course }: { course: CourseFormValues & { id: string; title: string } }) {
    const t = useT()
    const router = useRouter()
    const [editing, setEditing] = useState(false)
    const [busy, setBusy] = useState(false)

    const remove = async () => {
        if (!confirm(t('Delete "{name}"? This cannot be undone.', { name: course.title }))) return
        setBusy(true)
        const result = await deleteCourse(course.id).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        setBusy(false)
        if ('error' in result && result.error) {
            alert(t(result.error))
            return
        }
        router.push(`/courses/field/${String(course.field || '').toLowerCase()}`)
        router.refresh()
    }

    return (
        <div className={styles.manageRow}>
            <button type="button" className={styles.secondaryBtn} onClick={() => setEditing(true)}>
                <i className="fa-solid fa-pen" aria-hidden="true"></i> {t('Edit')}
            </button>
            <button type="button" className={styles.dangerBtn} onClick={remove} disabled={busy}>
                <i className={busy ? 'fa fa-spinner fa-spin' : 'fa-solid fa-trash'} aria-hidden="true"></i> {busy ? t('Deleting...') : t('Delete')}
            </button>
            {editing && <CourseDialog initial={course} onClose={() => setEditing(false)} />}
        </div>
    )
}
