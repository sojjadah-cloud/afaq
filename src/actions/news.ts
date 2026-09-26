'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createNews(formData: FormData) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }
    if (session.role !== 'STAFF' && session.role !== 'ADMIN') {
        return { error: 'Not authorized. Only staff and admins can add news.' }
    }

    const title = formData.get('title') as string
    const summary = formData.get('summary') as string
    const type = formData.get('type') as string
    const eventDate = formData.get('eventDate') as string
    const imageUrl = formData.get('imageUrl') as string

    if (!title || !summary || !type) {
        return { error: 'Title, summary, and type are required' }
    }

    try {
        const newsId = `news_${Date.now()}`

        await query(
            `INSERT INTO club_news (id, title, summary, imageUrl, type, eventDate, createdById, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [newsId, title, summary, imageUrl || null, type, eventDate || null, session.userId]
        )

        revalidatePath('/news')
        return { success: true, newsId }
    } catch (error) {
        console.error('Create news error:', error)
        return { error: 'Failed to create entry' }
    }
}

export async function deleteNews(newsId: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }
    if (session.role !== 'ADMIN') {
        return { error: 'Only admins can delete entries' }
    }

    try {
        await query('DELETE FROM club_news WHERE id = ?', [newsId])
        revalidatePath('/news')
        return { success: true }
    } catch (error) {
        console.error('Delete news error:', error)
        return { error: 'Failed to delete entry' }
    }
}
