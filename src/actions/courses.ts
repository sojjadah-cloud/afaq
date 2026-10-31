'use server'

import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { getActiveUser } from '@/lib/session'
import { RowDataPacket } from '@/lib/types'
import { isCourseField, isCourseKind, parseVideo } from '@/lib/courses'

async function requireStaff() {
    const user = await getActiveUser(await getSession())
    if (!user) return { error: 'Not authenticated' }
    if (user.role !== 'STAFF' && user.role !== 'ADMIN') return { error: 'Not authorized' }
    return { user }
}

async function audit(userId: string, action: string, recordId: string, data: object) {
    try {
        await query(
            `INSERT INTO audit_logs (id, userId, action, tableName, recordId, newData, createdAt)
             VALUES (?, ?, ?, 'courses', ?, ?, NOW())`,
            [`log_${Date.now()}_${randomBytes(3).toString('hex')}`, userId, action, recordId, JSON.stringify(data)]
        )
    } catch { /* audit log is non-critical */ }
}

function refresh(id?: string) {
    revalidatePath('/courses', 'layout')
    if (id) revalidatePath(`/courses/${id}`)
}

// Creates a course or workshop, or updates it when an id is given.
export async function saveCourse(formData: FormData) {
    const auth = await requireStaff()
    if ('error' in auth) return { error: auth.error }

    const text = (key: string) => String(formData.get(key) || '').trim()
    const id = text('id')
    const title = text('title')
    const kind = text('kind')
    const field = text('field')
    const summary = text('summary')
    const videoUrl = text('videoUrl')
    const instructor = text('instructor')
    const duration = text('duration')

    if (!title || !summary || !videoUrl) return { error: 'Title, overview and video link are required' }
    if (title.length > 200) return { error: 'Keep the title under 200 characters' }
    if (summary.length > 5000) return { error: 'Keep the overview under 5000 characters' }
    if (!isCourseKind(kind)) return { error: 'Choose whether this is a course or a workshop' }
    if (!isCourseField(field)) return { error: 'Choose a field' }
    if (!parseVideo(videoUrl)) return { error: 'Use a YouTube or Google Drive video link' }
    if (instructor.length > 120) return { error: 'Keep the presenter name under 120 characters' }
    if (duration.length > 60) return { error: 'Keep the duration under 60 characters' }

    try {
        if (id) {
            const existing = await query<RowDataPacket[]>('SELECT id FROM courses WHERE id = ?', [id])
            if (!existing[0]) return { error: 'Course not found' }
            await query(
                `UPDATE courses SET title = ?, kind = ?, field = ?, summary = ?, videoUrl = ?, instructor = ?, duration = ?, updatedAt = NOW()
                 WHERE id = ?`,
                [title, kind, field, summary, videoUrl, instructor || null, duration || null, id]
            )
            await audit(auth.user.id, 'COURSE_UPDATED', id, { title, field })
            refresh(id)
            return { success: true, id }
        }

        const newId = `course_${Date.now()}_${randomBytes(3).toString('hex')}`
        await query(
            `INSERT INTO courses (id, title, kind, field, summary, videoUrl, instructor, duration, createdById, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [newId, title, kind, field, summary, videoUrl, instructor || null, duration || null, auth.user.id]
        )
        await audit(auth.user.id, 'COURSE_CREATED', newId, { title, field })
        refresh()
        return { success: true, id: newId }
    } catch (error) {
        console.error('Save course error:', error)
        return { error: 'Failed to save the course' }
    }
}

export async function deleteCourse(id: string) {
    const auth = await requireStaff()
    if ('error' in auth) return { error: auth.error }

    try {
        const existing = await query<RowDataPacket[]>('SELECT title, field FROM courses WHERE id = ?', [id])
        if (!existing[0]) return { error: 'Course not found' }
        await query('DELETE FROM courses WHERE id = ?', [id])
        await audit(auth.user.id, 'COURSE_DELETED', id, { title: existing[0].title })
        refresh(id)
        return { success: true, field: String(existing[0].field) }
    } catch (error) {
        console.error('Delete course error:', error)
        return { error: 'Failed to delete the course' }
    }
}
