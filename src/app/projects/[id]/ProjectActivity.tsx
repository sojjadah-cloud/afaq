'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addProjectUpdate, assignSupervisor } from '@/actions/projects'
import styles from './page.module.css'

export interface ActivityItem {
    id: string
    type: 'UPDATE' | 'FEEDBACK' | 'STATUS'
    message: string
    progress: number | null
    createdAt: string
    authorName: string
    authorRole: string
}

const TYPE_META = {
    UPDATE: { icon: 'fa-chart-line', label: 'Progress update' },
    FEEDBACK: { icon: 'fa-comment-dots', label: 'Technical feedback' },
    STATUS: { icon: 'fa-flag', label: 'Status' },
}

function when(value: string) {
    const [date, time] = String(value).split(' ')
    const [y, m, d] = date.split('-').map(Number)
    const label = new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    return time ? `${label}, ${time.slice(0, 5)}` : label
}

export default function ProjectActivity({
    projectId, items, canPostUpdate, canPostFeedback, currentProgress, isCompleted,
}: {
    projectId: string
    items: ActivityItem[]
    canPostUpdate: boolean
    canPostFeedback: boolean
    currentProgress: number
    isCompleted: boolean
}) {
    const router = useRouter()
    const [progress, setProgress] = useState(currentProgress)
    const [changeProgress, setChangeProgress] = useState(false)
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const canPost = canPostUpdate || canPostFeedback

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        const fd = new FormData(form)
        if (!changeProgress) fd.delete('progress')
        setError('')
        setBusy(true)
        const result = await addProjectUpdate(projectId, fd).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        setBusy(false)
        if ('error' in result && result.error) {
            setError(result.error)
            return
        }
        form.reset()
        setChangeProgress(false)
        router.refresh()
    }

    return (
        <section className={styles.section} aria-labelledby="activity-title">
            <h2 id="activity-title">Activity</h2>

            {canPost && (
                <form onSubmit={submit} className={styles.activityForm}>
                    <label htmlFor="update-message" className={styles.activityLabel}>
                        {canPostUpdate ? 'Post a progress update' : 'Add technical feedback'}
                    </label>
                    <textarea
                        id="update-message"
                        name="message"
                        rows={3}
                        required
                        minLength={3}
                        maxLength={2000}
                        placeholder={canPostUpdate ? 'What has the team done since the last update?' : 'Feedback, recommendations or required changes for the team'}
                    />
                    {canPostUpdate && !isCompleted && (
                        <div className={styles.progressPicker}>
                            <label className={styles.checkLine}>
                                <input type="checkbox" checked={changeProgress} onChange={e => setChangeProgress(e.target.checked)} />
                                Update progress
                            </label>
                            {changeProgress && (
                                <div className={styles.sliderRow}>
                                    <input
                                        type="range"
                                        name="progress"
                                        min={0}
                                        max={95}
                                        step={5}
                                        value={Math.min(progress, 95)}
                                        onChange={e => setProgress(Number(e.target.value))}
                                        aria-label="Project progress"
                                    />
                                    <strong>{Math.min(progress, 95)}%</strong>
                                </div>
                            )}
                            {changeProgress && <small>100% is set when the completion review is approved.</small>}
                        </div>
                    )}
                    {error && <div className={styles.formError}>{error}</div>}
                    <button type="submit" className={styles.postBtn} disabled={busy}>
                        {busy ? 'Posting...' : canPostUpdate ? 'Post update' : 'Post feedback'}
                    </button>
                </form>
            )}

            {items.length === 0 ? (
                <p className={styles.empty}>No activity yet.</p>
            ) : (
                <ol className={styles.timeline}>
                    {items.map(item => {
                        const meta = TYPE_META[item.type] || TYPE_META.STATUS
                        return (
                            <li key={item.id} className={`${styles.timelineItem} ${styles[`timeline${item.type}`] || ''}`}>
                                <span className={styles.timelineIcon}><i className={`fa-solid ${meta.icon}`}></i></span>
                                <div className={styles.timelineBody}>
                                    <div className={styles.timelineHead}>
                                        <strong>{item.authorName}</strong>
                                        <span className={styles.timelineType}>{meta.label}</span>
                                        <time>{when(item.createdAt)}</time>
                                    </div>
                                    <p>{item.message}</p>
                                    {item.progress !== null && <span className={styles.timelineProgress}>Progress set to {item.progress}%</span>}
                                </div>
                            </li>
                        )
                    })}
                </ol>
            )}
        </section>
    )
}

export function SupervisorPicker({ projectId, current, staff }: { projectId: string; current: string; staff: { id: string; name: string }[] }) {
    const router = useRouter()
    const [busy, setBusy] = useState(false)

    const change = async (value: string) => {
        setBusy(true)
        const result = await assignSupervisor(projectId, value).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        setBusy(false)
        if ('error' in result && result.error) alert(result.error)
        router.refresh()
    }

    return (
        <select
            className={styles.supervisorSelect}
            value={current}
            disabled={busy}
            onChange={e => change(e.target.value)}
            aria-label="Assign supervisor"
        >
            <option value="">No supervisor</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
    )
}
