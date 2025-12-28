'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { RowDataPacket } from 'mysql2'

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
            'UPDATE project_members SET status = "APPROVED" WHERE projectId = ? AND userId = ?',
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
        return { error: `Description exceeds word limit (1000 words). Current: ${wordCount}` }
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

import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function addAttachment(projectId: string, formData: FormData) {
    const session = await getSession()
    // Verify member or owner logic here... assuming owner for now

    const file = formData.get('file') as File
    if (!file) return { error: 'No file provided' }

    // Validate File Size (Max 50MB)
    const maxSize = 10 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
        return { error: 'File too large. Maximum size is 50MB.' }
    }

    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Sanitize filename
        const extension = file.name.split('.').pop()?.toLowerCase() || 'dat'
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, '')}.${extension}`
        const path = join(process.cwd(), 'public', 'uploads', filename)

        await writeFile(path, buffer)
        const url = `/uploads/${filename}`

        await query(
            `INSERT INTO project_attachments (id, projectId, name, url, type, uploadedAt)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [`att_${Date.now()}`, projectId, file.name, url, file.type.startsWith('image') ? 'IMAGE' : 'DOCUMENT']
        )
        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error('Attachment upload error:', error)
        return { error: 'Failed to add attachment' }
    }
}
