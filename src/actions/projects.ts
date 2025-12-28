'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { RowDataPacket } from 'mysql2'

export async function createProject(formData: FormData) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const status = (formData.get('status') as string) || 'START'

    // Validation
    if (!title || !description || !category) {
        return { error: 'All fields are required' }
    }

    if (title.length > 200) {
        return { error: 'Title must be 200 characters or less' }
    }

    const wordCount = description.trim().split(/\s+/).length
    if (wordCount > 1000) {
        return { error: `Description exceeds word limit (1000 words). Current: ${wordCount}` }
    }

    try {
        const projectId = `proj_${Date.now()}`

        // Create project
        await query(
            `INSERT INTO projects (id, title, description, category, status, progress, createdById, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, 0, ?, NOW(), NOW())`,
            [projectId, title, description, category, status, session.userId]
        )

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
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary (only if credentials are available)
if (process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })
}

export async function addAttachment(projectId: string, formData: FormData) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }

    const file = formData.get('file') as File
    if (!file) return { error: 'No file provided' }

    // Validate File Size (Max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
        return { error: 'File too large. Maximum size is 10MB.' }
    }

    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL
        const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET

        let url: string

        // Use Cloudinary in production if configured
        if (isProduction && hasCloudinary) {
            // Upload to Cloudinary
            const base64File = `data:${file.type};base64,${buffer.toString('base64')}`

            const uploadResult = await cloudinary.uploader.upload(base64File, {
                folder: 'afaq-innovation',
                resource_type: 'auto',
                public_id: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`,
            })

            url = uploadResult.secure_url
        } else if (isProduction && !hasCloudinary) {
            // Production but no cloud storage configured
            return {
                error: 'File uploads require cloud storage. Please configure Cloudinary environment variables in Vercel.'
            }
        } else {
            // Local development: save to public/uploads
            const { mkdir } = await import('fs/promises')
            const extension = file.name.split('.').pop()?.toLowerCase() || 'dat'
            const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}.${extension}`
            const uploadsDir = join(process.cwd(), 'public', 'uploads')

            await mkdir(uploadsDir, { recursive: true })

            const path = join(uploadsDir, filename)
            await writeFile(path, buffer)
            url = `/uploads/${filename}`
        }

        // Save to database
        await query(
            `INSERT INTO project_attachments (id, projectId, name, url, type, uploadedAt)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [`att_${Date.now()}`, projectId, file.name, url, file.type.startsWith('image') ? 'IMAGE' : 'DOCUMENT']
        )

        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error('Attachment upload error:', error)
        return { error: 'Failed to add attachment. ' + (error instanceof Error ? error.message : 'Unknown error') }
    }
}
