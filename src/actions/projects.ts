'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { RowDataPacket } from '@/lib/types'
import { getProjectSection } from '@/lib/sections'
import { saveUpload, FORM_EXTENSIONS, ATTACHMENT_EXTENSIONS } from '@/lib/files'
import { getActiveUser } from '@/lib/session'
import { createNotification } from '@/lib/notify'
import { randomBytes } from 'crypto'
import { getT } from '@/i18n/server'

export async function createProject(formData: FormData) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const status = formData.get('status') === 'DEVELOPMENT' ? 'DEVELOPMENT' : 'START'
    const section = await getProjectSection(String(formData.get('section') || ''))

    // Validation
    if (!title || !description || !category) {
        return { error: 'All fields are required' }
    }
    if (!section) {
        return { error: 'Please choose the department or the Scientific Club' }
    }

    if (title.length > 200) {
        return { error: 'Title must be 200 characters or less' }
    }

    const wordCount = description.trim().split(/\s+/).length
    if (wordCount > 1000) {
        return { error: (await getT()).t('Description exceeds the 1000-word limit (currently {n} words)', { n: wordCount }) }
    }

    const form = await saveUpload(formData.get('applicationForm') as File | null, {
        allowed: FORM_EXTENSIONS,
        userId: session.userId,
        label: 'The completed application form',
    })
    if ('error' in form) {
        return { error: form.error }
    }

    try {
        const projectId = `proj_${Date.now()}`

        await query(
            `INSERT INTO projects (id, title, description, category, status, progress, departmentId, createdById, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, 0, ?, ?, NOW(), NOW())`,
            [projectId, title, description, category, status, section.departmentId, session.userId]
        )

        await query(
            `INSERT INTO project_attachments (id, projectId, name, url, type, uploadedAt)
             VALUES (?, ?, ?, ?, 'DOCUMENT', NOW())`,
            [`att_${Date.now()}`, projectId, `Application Form - ${form.name}`, form.url]
        )

        await logProjectEvent(projectId, session.userId, 'Created the project with its application form')

        // Auto-add creator as owner/member
        await query(
            `INSERT INTO project_members (id, projectId, userId, role, status, joinedAt)
             VALUES (?, ?, ?, 'Owner', 'APPROVED', NOW())`,
            [`pm_${Date.now()}`, projectId, session.userId]
        )

        revalidatePath('/projects')
        revalidatePath('/projects/start')
        revalidatePath('/projects/development')

        return { success: true, projectId }
    } catch (error) {
        console.error('Create project error:', error)
        await query('DELETE FROM files WHERE id = ?', [form.id]).catch(() => {})
        return { error: 'Failed to create project' }
    }
}

export async function joinProject(projectId: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }

    try {
        // Check if already a member
        const existing = await query<RowDataPacket[]>(
            'SELECT * FROM project_members WHERE projectId = ? AND userId = ?',
            [projectId, session.userId]
        )

        if (existing.length > 0) {
            return { error: 'Already a member or request pending' }
        }

        await query(
            `INSERT INTO project_members (id, projectId, userId, role, status, joinedAt) 
             VALUES (?, ?, ?, 'Member', 'PENDING', NOW())`,
            [`pm_${Date.now()}`, projectId, session.userId]
        )

        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error('Join project error:', error)
        return { error: 'Failed to join project' }
    }
}

export async function approveMember(projectId: string, userId: string) {
    const session = await getSession()
    // Verify owner
    const project = await query<RowDataPacket[]>('SELECT createdById FROM projects WHERE id = ?', [projectId])
    if (!project[0] || project[0].createdById !== session.userId) {
        return { error: 'Not authorized' }
    }

    try {
        await query(
            'UPDATE project_members SET status = \'APPROVED\' WHERE projectId = ? AND userId = ?',
            [projectId, userId]
        )
        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        return { error: 'Failed to approve member' }
    }
}

export async function editProject(projectId: string, formData: FormData) {
    const session = await getSession()

    // Verify owner
    const project = await query<RowDataPacket[]>('SELECT createdById, status FROM projects WHERE id = ?', [projectId])
    if (!project[0] || project[0].createdById !== session.userId) {
        return { error: 'Not authorized' }
    }

    if (project[0].status === 'COMPLETED') {
        return { error: 'Cannot edit completed projects' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!title || !description) return { error: 'Missing fields' }

    // Enforce word limit (e.g., 1000 words)
    const wordCount = description.trim().split(/\s+/).length
    if (wordCount > 1000) {
        return { error: (await getT()).t('Description exceeds the 1000-word limit (currently {n} words)', { n: wordCount }) }
    }

    try {
        await query(
            'UPDATE projects SET title = ?, description = ?, updatedAt = NOW() WHERE id = ?',
            [title, description, projectId]
        )
        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        return { error: 'Failed to update project' }
    }
}

export async function addAttachment(projectId: string, formData: FormData) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }

    const isStaff = session.role === 'ADMIN' || session.role === 'STAFF'
    if (!isStaff) {
        const membership = await query<RowDataPacket[]>(
            `SELECT 1 FROM projects p
             LEFT JOIN project_members pm ON pm.projectId = p.id AND pm.userId = ? AND pm.status = 'APPROVED'
             WHERE p.id = ? AND (p.createdById = ? OR pm.userId IS NOT NULL)`,
            [session.userId, projectId, session.userId]
        )
        if (membership.length === 0) {
            return { error: 'Only project members can add attachments' }
        }
    }

    try {
        const saved = await saveUpload(formData.get('file') as File | null, {
            allowed: ATTACHMENT_EXTENSIONS,
            userId: session.userId,
        })
        if ('error' in saved) return { error: saved.error }

        await query(
            `INSERT INTO project_attachments (id, projectId, name, url, type, uploadedAt)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [`att_${Date.now()}`, projectId, saved.name, saved.url, saved.isImage ? 'IMAGE' : 'DOCUMENT']
        )

        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error('Attachment upload error:', error)
        return { error: 'Failed to add attachment. ' + (error instanceof Error ? error.message : 'Unknown error') }
    }
}

// ============== PROJECT WORKFLOW ACTIONS ==============

export async function requestApproval(projectId: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }

    const project = await query<RowDataPacket[]>('SELECT createdById, status FROM projects WHERE id = ?', [projectId])
    if (!project[0] || project[0].createdById !== session.userId) {
        return { error: 'Not authorized' }
    }

    if (project[0].status !== 'START') {
        return { error: 'Project must be in START status to request approval' }
    }

    try {
        await query('UPDATE projects SET status = \'PENDING_APPROVAL\', updatedAt = NOW() WHERE id = ?', [projectId])
        await logProjectEvent(projectId, session.userId, 'Submitted the project for approval')

        // Audit log
        try {
            await query(
                `INSERT INTO audit_logs (id, userId, action, tableName, recordId, newData, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [`log_${Date.now()}`, session.userId, 'PROJECT_APPROVAL_REQUESTED', 'projects', projectId, JSON.stringify({ status: 'PENDING_APPROVAL' })]
            )
        } catch (e) { /* non-critical */ }

        revalidatePath(`/projects/${projectId}`)
        revalidatePath('/admin/projects')
        return { success: true }
    } catch (error) {
        console.error('Request approval error:', error)
        return { error: 'Failed to request approval' }
    }
}

export async function requestCompletion(projectId: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }

    const project = await query<RowDataPacket[]>('SELECT createdById, status FROM projects WHERE id = ?', [projectId])
    if (!project[0] || project[0].createdById !== session.userId) {
        return { error: 'Not authorized' }
    }

    if (project[0].status !== 'DEVELOPMENT') {
        return { error: 'Project must be in DEVELOPMENT status to request completion' }
    }

    try {
        await query('UPDATE projects SET status = \'PENDING_COMPLETION\', updatedAt = NOW() WHERE id = ?', [projectId])
        await logProjectEvent(projectId, session.userId, 'Requested completion review')

        // Audit log
        try {
            await query(
                `INSERT INTO audit_logs (id, userId, action, tableName, recordId, newData, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [`log_${Date.now()}`, session.userId, 'PROJECT_COMPLETION_REQUESTED', 'projects', projectId, JSON.stringify({ status: 'PENDING_COMPLETION' })]
            )
        } catch (e) { /* non-critical */ }

        revalidatePath(`/projects/${projectId}`)
        revalidatePath('/admin/projects')
        return { success: true }
    } catch (error) {
        console.error('Request completion error:', error)
        return { error: 'Failed to request completion' }
    }
}

export async function transferOwnership(projectId: string, newOwnerId: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }

    const project = await query<RowDataPacket[]>('SELECT createdById, status FROM projects WHERE id = ?', [projectId])
    if (!project[0] || project[0].createdById !== session.userId) {
        return { error: 'Not authorized' }
    }

    if (project[0].status === 'COMPLETED' || project[0].status === 'PENDING_APPROVAL' || project[0].status === 'PENDING_COMPLETION') {
        return { error: 'Cannot transfer ownership in current project state' }
    }

    // Verify new owner is an approved member
    const member = await query<RowDataPacket[]>(
        'SELECT * FROM project_members WHERE projectId = ? AND userId = ? AND status = \'APPROVED\'',
        [projectId, newOwnerId]
    )
    if (member.length === 0) {
        return { error: 'New owner must be an approved project member' }
    }

    try {
        // Update project owner
        await query('UPDATE projects SET createdById = ?, updatedAt = NOW() WHERE id = ?', [newOwnerId, projectId])

        // Update member roles
        await query('UPDATE project_members SET role = \'Member\' WHERE projectId = ? AND userId = ?', [projectId, session.userId])
        await query('UPDATE project_members SET role = \'Owner\' WHERE projectId = ? AND userId = ?', [projectId, newOwnerId])
        await logProjectEvent(projectId, session.userId, 'Transferred project ownership')

        // Audit log
        try {
            await query(
                `INSERT INTO audit_logs (id, userId, action, tableName, recordId, newData, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [`log_${Date.now()}`, session.userId, 'PROJECT_OWNERSHIP_TRANSFERRED', 'projects', projectId, JSON.stringify({ newOwnerId })]
            )
        } catch (e) { /* non-critical */ }

        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error('Transfer ownership error:', error)
        return { error: 'Failed to transfer ownership' }
    }
}

// ============== ADMIN PROJECT ACTIONS ==============

export async function adminApproveProject(projectId: string) {
    const session = await getSession()
    if (!session.isLoggedIn || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
        return { error: 'Not authorized' }
    }

    const project = await query<RowDataPacket[]>('SELECT status FROM projects WHERE id = ?', [projectId])
    if (!project[0] || project[0].status !== 'PENDING_APPROVAL') {
        return { error: 'Project is not pending approval' }
    }

    try {
        await query('UPDATE projects SET status = \'DEVELOPMENT\', updatedAt = NOW() WHERE id = ?', [projectId])
        await logProjectEvent(projectId, session.userId, 'Approved the project; development started')

        // Notify project owner
        const proj = await query<RowDataPacket[]>('SELECT createdById, title FROM projects WHERE id = ?', [projectId])
        if (proj[0]) {
            await query(
                `INSERT INTO notifications (id, userId, type, title, message, link, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [`notif_${Date.now()}`, proj[0].createdById, 'PROJECT_APPROVED', 'Project Approved!',
                `Your project "${proj[0].title}" has been approved and is now in development.`,
                `/projects/${projectId}`]
            )
        }

        revalidatePath(`/projects/${projectId}`)
        revalidatePath('/admin/projects')
        return { success: true }
    } catch (error) {
        console.error('Admin approve error:', error)
        return { error: 'Failed to approve project' }
    }
}

export async function adminValidateCompletion(projectId: string) {
    const session = await getSession()
    if (!session.isLoggedIn || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
        return { error: 'Not authorized' }
    }

    const project = await query<RowDataPacket[]>('SELECT status FROM projects WHERE id = ?', [projectId])
    if (!project[0] || project[0].status !== 'PENDING_COMPLETION') {
        return { error: 'Project is not pending completion validation' }
    }

    try {
        await query('UPDATE projects SET status = \'COMPLETED\', progress = 100, updatedAt = NOW() WHERE id = ?', [projectId])
        await logProjectEvent(projectId, session.userId, 'Confirmed completion; project marked as completed')

        // Notify project owner
        const proj = await query<RowDataPacket[]>('SELECT createdById, title FROM projects WHERE id = ?', [projectId])
        if (proj[0]) {
            await query(
                `INSERT INTO notifications (id, userId, type, title, message, link, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [`notif_${Date.now()}`, proj[0].createdById, 'PROJECT_COMPLETED', 'Project Completed!',
                `Your project "${proj[0].title}" has been marked as completed. Congratulations!`,
                `/projects/${projectId}`]
            )
        }

        revalidatePath(`/projects/${projectId}`)
        revalidatePath('/admin/projects')
        revalidatePath('/projects/completed')
        return { success: true }
    } catch (error) {
        console.error('Admin validate completion error:', error)
        return { error: 'Failed to validate completion' }
    }
}

export async function adminRejectProject(projectId: string, reason?: string) {
    const session = await getSession()
    if (!session.isLoggedIn || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
        return { error: 'Not authorized' }
    }

    const project = await query<RowDataPacket[]>('SELECT status, createdById, title FROM projects WHERE id = ?', [projectId])
    if (!project[0]) {
        return { error: 'Project not found' }
    }

    let newStatus: string
    if (project[0].status === 'PENDING_APPROVAL') {
        newStatus = 'START'
    } else if (project[0].status === 'PENDING_COMPLETION') {
        newStatus = 'DEVELOPMENT'
    } else {
        return { error: 'Project is not in a pending state' }
    }

    try {
        await query('UPDATE projects SET status = ?, updatedAt = NOW() WHERE id = ?', [newStatus, projectId])
        await logProjectEvent(projectId, session.userId, `Returned the request for revision${reason ? `: ${reason}` : ''}`)

        // Notify project owner
        await query(
            `INSERT INTO notifications (id, userId, type, title, message, link, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [`notif_${Date.now()}`, project[0].createdById, 'PROJECT_REJECTED', 'Project Request Rejected',
            `Your project "${project[0].title}" request was not approved.${reason ? ` Reason: ${reason}` : ''}`,
            `/projects/${projectId}`]
        )

        revalidatePath(`/projects/${projectId}`)
        revalidatePath('/admin/projects')
        return { success: true }
    } catch (error) {
        console.error('Admin reject error:', error)
        return { error: 'Failed to reject project' }
    }
}

export async function getPendingProjects() {
    const session = await getSession()
    if (!session.isLoggedIn || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
        return []
    }

    try {
        const projects = await query<RowDataPacket[]>(`
            SELECT p.*, sp.fullName as creatorName, u.militaryId
            FROM projects p
            LEFT JOIN users u ON p.createdById = u.id
            LEFT JOIN student_profiles sp ON u.id = sp.userId
            WHERE p.status IN ('PENDING_APPROVAL', 'PENDING_COMPLETION')
            ORDER BY p.updatedAt DESC
        `)
        return projects
    } catch (error) {
        console.error('Get pending projects error:', error)
        return []
    }
}

// ============== PROJECT ACTIVITY ==============

async function logProjectEvent(projectId: string, userId: string, message: string) {
    try {
        await query(
            `INSERT INTO project_updates (id, projectId, userId, type, message, createdAt) VALUES (?, ?, ?, 'STATUS', ?, NOW())`,
            [`upd_${Date.now()}_${randomBytes(3).toString('hex')}`, projectId, userId, message]
        )
    } catch { /* activity log is non-critical */ }
}

// Members post progress updates (optionally with a new progress %); staff post technical feedback.
export async function addProjectUpdate(projectId: string, formData: FormData) {
    const session = await getSession()
    const user = await getActiveUser(session)
    if (!user) return { error: 'Not authenticated' }

    const message = String(formData.get('message') || '').trim()
    if (message.length < 3) return { error: 'Write a short update first' }
    if (message.length > 2000) return { error: 'Keep the update under 2000 characters' }

    const rows = await query<RowDataPacket[]>('SELECT id, title, status, createdById, supervisorId FROM projects WHERE id = ?', [projectId])
    const project = rows[0]
    if (!project) return { error: 'Project not found' }

    const isStaff = user.role === 'ADMIN' || user.role === 'STAFF'
    const membership = await query<RowDataPacket[]>(
        "SELECT 1 FROM project_members WHERE projectId = ? AND userId = ? AND status = 'APPROVED'",
        [projectId, user.id]
    )
    const isMember = project.createdById === user.id || membership.length > 0
    if (!isMember && !isStaff) return { error: 'Only project members and staff can post updates' }

    const type = isMember ? 'UPDATE' : 'FEEDBACK'
    let progress: number | null = null
    const rawProgress = String(formData.get('progress') ?? '')
    if (type === 'UPDATE' && rawProgress !== '') {
        progress = Math.round(Number(rawProgress))
        if (!Number.isFinite(progress) || progress < 0 || progress > 100) return { error: 'Progress must be between 0 and 100' }
        if (project.status === 'COMPLETED') return { error: 'Completed projects cannot change progress' }
        // 100% is reserved for confirmed completion.
        if (progress === 100) progress = 95
    }

    await query(
        'INSERT INTO project_updates (id, projectId, userId, type, message, progress, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [`upd_${Date.now()}_${randomBytes(3).toString('hex')}`, projectId, user.id, type, message, progress]
    )
    if (progress !== null) {
        await query('UPDATE projects SET progress = ?, updatedAt = NOW() WHERE id = ?', [progress, projectId])
    } else {
        await query('UPDATE projects SET updatedAt = NOW() WHERE id = ?', [projectId])
    }

    if (type === 'FEEDBACK') {
        await createNotification(project.createdById, 'PROJECT_FEEDBACK', 'New feedback on your project', `Feedback was added to "${project.title}".`, `/projects/${projectId}`)
    } else if (project.supervisorId && project.supervisorId !== user.id) {
        await createNotification(project.supervisorId, 'PROJECT_UPDATE', 'Project update', `"${project.title}" has a new progress update.`, `/projects/${projectId}`)
    }

    revalidatePath(`/projects/${projectId}`)
    return { success: true }
}

export async function assignSupervisor(projectId: string, supervisorId: string) {
    const session = await getSession()
    const user = await getActiveUser(session)
    if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) return { error: 'Not authorized' }

    const project = await query<RowDataPacket[]>('SELECT title FROM projects WHERE id = ?', [projectId])
    if (!project[0]) return { error: 'Project not found' }

    let name = ''
    if (supervisorId) {
        const sup = await query<RowDataPacket[]>(
            `SELECT u.id, COALESCE(sp.fullName, u.militaryId) as name FROM users u
             LEFT JOIN student_profiles sp ON sp.userId = u.id
             WHERE u.id = ? AND u.role IN ('STAFF', 'ADMIN') AND u.isActive = 1`,
            [supervisorId]
        )
        if (!sup[0]) return { error: 'Choose an active staff member' }
        name = sup[0].name
    }

    await query('UPDATE projects SET supervisorId = ?, updatedAt = NOW() WHERE id = ?', [supervisorId || null, projectId])
    await logProjectEvent(projectId, user.id, supervisorId ? `Assigned ${name} as supervisor` : 'Removed the supervisor')
    if (supervisorId && supervisorId !== user.id) {
        await createNotification(supervisorId, 'PROJECT_SUPERVISOR', 'You are supervising a project', `You were assigned to supervise "${project[0].title}".`, `/projects/${projectId}`)
    }
    revalidatePath(`/projects/${projectId}`)
    revalidatePath('/staff')
    return { success: true }
}
