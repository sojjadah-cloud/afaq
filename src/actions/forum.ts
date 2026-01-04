'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { RowDataPacket } from 'mysql2'

// ============== FORUM CATEGORIES ==============

export async function getForumCategories() {
    try {
        const categories = await query<RowDataPacket[]>(`
            SELECT fc.*, COUNT(fp.id) as topicCount
            FROM forum_categories fc
            LEFT JOIN forum_posts fp ON fc.id = fp.categoryId AND fp.parentId IS NULL
            GROUP BY fc.id
            ORDER BY fc.sortOrder ASC
        `)
        return categories
    } catch (error) {
        console.error('Get forum categories error:', error)
        return []
    }
}

// ============== FORUM POSTS/TOPICS ==============

export async function createForumTopic(formData: FormData) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const categoryId = formData.get('categoryId') as string

    if (!title || !content || !categoryId) {
        return { error: 'Title, content, and category are required' }
    }

    if (title.length > 200) {
        return { error: 'Title must be less than 200 characters' }
    }

    try {
        const postId = `post_${Date.now()}`

        await query(
            `INSERT INTO forum_posts (id, title, content, categoryId, authorId, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [postId, title, content, categoryId, session.userId]
        )

        revalidatePath('/forums')
        revalidatePath(`/forums/${categoryId}`)
        return { success: true, postId }
    } catch (error) {
        console.error('Create forum topic error:', error)
        return { error: 'Failed to create topic' }
    }
}

export async function getForumTopics(categoryId: string) {
    try {
        const topics = await query<RowDataPacket[]>(`
            SELECT 
                fp.*,
                COALESCE(sp.fullName, u.email) as authorName,
                u.militaryId as authorMilitaryId,
                (SELECT COUNT(*) FROM forum_posts WHERE parentId = fp.id) as replyCount,
                (SELECT MAX(createdAt) FROM forum_posts WHERE parentId = fp.id OR id = fp.id) as lastActivity
            FROM forum_posts fp
            JOIN users u ON fp.authorId = u.id
            LEFT JOIN student_profiles sp ON u.id = sp.userId
            WHERE fp.categoryId = ? AND fp.parentId IS NULL
            ORDER BY fp.isPinned DESC, lastActivity DESC
        `, [categoryId])
        return topics
    } catch (error) {
        console.error('Get forum topics error:', error)
        return []
    }
}

export async function getForumTopic(topicId: string) {
    try {
        const topic = await query<RowDataPacket[]>(`
            SELECT 
                fp.*,
                COALESCE(sp.fullName, u.email) as authorName,
                u.militaryId as authorMilitaryId
            FROM forum_posts fp
            JOIN users u ON fp.authorId = u.id
            LEFT JOIN student_profiles sp ON u.id = sp.userId
            WHERE fp.id = ? AND fp.parentId IS NULL
        `, [topicId])

        if (!topic[0]) return null

        // Get replies
        const replies = await query<RowDataPacket[]>(`
            SELECT 
                fp.*,
                COALESCE(sp.fullName, u.email) as authorName,
                u.militaryId as authorMilitaryId
            FROM forum_posts fp
            JOIN users u ON fp.authorId = u.id
            LEFT JOIN student_profiles sp ON u.id = sp.userId
            WHERE fp.parentId = ?
            ORDER BY fp.createdAt ASC
        `, [topicId])

        return { ...topic[0], replies }
    } catch (error) {
        console.error('Get forum topic error:', error)
        return null
    }
}

export async function createForumReply(topicId: string, formData: FormData) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }

    const content = formData.get('content') as string

    if (!content) {
        return { error: 'Reply content is required' }
    }

    try {
        // Get the topic's categoryId
        const topic = await query<RowDataPacket[]>(
            'SELECT categoryId FROM forum_posts WHERE id = ?',
            [topicId]
        )

        if (!topic[0]) return { error: 'Topic not found' }

        const replyId = `reply_${Date.now()}`

        await query(
            `INSERT INTO forum_posts (id, content, categoryId, authorId, parentId, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [replyId, content, topic[0].categoryId, session.userId, topicId]
        )

        // Update topic's updatedAt
        await query(
            'UPDATE forum_posts SET updatedAt = NOW() WHERE id = ?',
            [topicId]
        )

        revalidatePath(`/forums/topic/${topicId}`)
        return { success: true }
    } catch (error) {
        console.error('Create forum reply error:', error)
        return { error: 'Failed to post reply' }
    }
}

export async function deleteForumPost(postId: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }

    try {
        // Check ownership or admin
        const post = await query<RowDataPacket[]>(
            'SELECT authorId, categoryId, parentId FROM forum_posts WHERE id = ?',
            [postId]
        )

        if (!post[0]) return { error: 'Post not found' }

        if (post[0].authorId !== session.userId && session.role !== 'ADMIN') {
            return { error: 'Not authorized' }
        }

        // Delete post and all replies if it's a topic
        await query('DELETE FROM forum_posts WHERE id = ? OR parentId = ?', [postId, postId])

        revalidatePath('/forums')
        return { success: true }
    } catch (error) {
        console.error('Delete forum post error:', error)
        return { error: 'Failed to delete post' }
    }
}
