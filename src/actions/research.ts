'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { RowDataPacket } from '@/lib/types'

export async function createResearch(formData: FormData) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }
    if (session.role !== 'STAFF' && session.role !== 'ADMIN') {
        return { error: 'Not authorized. Only staff and admins can add research.' }
    }

    const title = formData.get('title') as string
    const abstract = formData.get('abstract') as string
    const authors = formData.get('authors') as string
    const category = formData.get('category') as string
    const publicationDate = formData.get('publicationDate') as string
    const url = formData.get('url') as string

    if (!title || !abstract || !authors || !category) {
        return { error: 'Title, abstract, authors, and category are required' }
    }

    try {
        const researchId = `res_${Date.now()}`

        await query(
            `INSERT INTO research (id, title, abstract, authors, category, publicationDate, url, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [researchId, title, abstract, authors, category, publicationDate || null, url || null]
        )

        revalidatePath('/research')
        return { success: true, researchId }
    } catch (error) {
        console.error('Create research error:', error)
        return { error: 'Failed to create research entry' }
    }
}

export async function updateResearch(researchId: string, formData: FormData) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }
    if (session.role !== 'STAFF' && session.role !== 'ADMIN') {
        return { error: 'Not authorized' }
    }

    const title = formData.get('title') as string
    const abstract = formData.get('abstract') as string
    const authors = formData.get('authors') as string
    const category = formData.get('category') as string
    const publicationDate = formData.get('publicationDate') as string
    const url = formData.get('url') as string

    if (!title || !abstract || !authors || !category) {
        return { error: 'Required fields missing' }
    }

    try {
        await query(
            `UPDATE research 
             SET title = ?, abstract = ?, authors = ?, category = ?, publicationDate = ?, url = ?, updatedAt = NOW()
             WHERE id = ?`,
            [title, abstract, authors, category, publicationDate || null, url || null, researchId]
        )

        revalidatePath('/research')
        revalidatePath(`/research/${researchId}`)
        return { success: true }
    } catch (error) {
        console.error('Update research error:', error)
        return { error: 'Failed to update research' }
    }
}

export async function deleteResearch(researchId: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }
    if (session.role !== 'ADMIN') {
        return { error: 'Only admins can delete research entries' }
    }

    try {
        await query('DELETE FROM research WHERE id = ?', [researchId])
        revalidatePath('/research')
        return { success: true }
    } catch (error) {
        console.error('Delete research error:', error)
        return { error: 'Failed to delete research' }
    }
}

export async function getResearchList() {
    try {
        const research = await query<RowDataPacket[]>(`
            SELECT * FROM research 
            ORDER BY publicationDate DESC, createdAt DESC
        `)
        return research
    } catch (error) {
        console.error('Get research error:', error)
        return []
    }
}

export async function getResearchById(id: string) {
    try {
        const result = await query<RowDataPacket[]>(
            'SELECT * FROM research WHERE id = ?',
            [id]
        )
        return result[0] || null
    } catch (error) {
        console.error('Get research by id error:', error)
        return null
    }
}
