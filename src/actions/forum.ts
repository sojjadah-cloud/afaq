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

        // @everyone - If admin posts in announcements, notify all users
        if (categoryId === 'cat_announcements' && (session.role === 'ADMIN' || session.role === 'STAFF')) {
            try {
                // Get all users except the poster
                const allUsers = await query<RowDataPacket[]>(
                    'SELECT id FROM users WHERE id != ?',
                    [session.userId]
                )

                // Send notification to everyone
                for (const user of allUsers) {
                    await createNotification(
                        user.id,
                        'ANNOUNCEMENT',
                        '📢 New Announcement',
                        `${title.slice(0, 60)}...`,
                        `/forums/topic/${postId}`
                    )
                }
            } catch (notifError) {
                console.error('Failed to send @everyone notifications:', notifError)
            }
        }

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
            JOIN users u ON fp.authorId COLLATE utf8mb4_general_ci = u.id COLLATE utf8mb4_general_ci
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
            JOIN users u ON fp.authorId COLLATE utf8mb4_general_ci = u.id COLLATE utf8mb4_general_ci
            LEFT JOIN student_profiles sp ON u.id = sp.userId
            WHERE fp.id = ? AND fp.parentId IS NULL
        `, [topicId])

        if (!topic[0]) return null

        // Get replies (including nested reply info)
        const replies = await query<RowDataPacket[]>(`
            SELECT 
                fp.*,
                COALESCE(sp.fullName, u.email) as authorName,
                u.militaryId as authorMilitaryId,
                COALESCE(rsp.fullName, ru.email) as replyToAuthorName
            FROM forum_posts fp
            JOIN users u ON fp.authorId COLLATE utf8mb4_general_ci = u.id COLLATE utf8mb4_general_ci
            LEFT JOIN student_profiles sp ON u.id = sp.userId
            LEFT JOIN forum_posts rp ON fp.replyToId = rp.id
            LEFT JOIN users ru ON rp.authorId COLLATE utf8mb4_general_ci = ru.id COLLATE utf8mb4_general_ci
            LEFT JOIN student_profiles rsp ON ru.id = rsp.userId
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
    const replyToId = formData.get('replyToId') as string | null // For nested replies

    if (!content) {
        return { error: 'Reply content is required' }
    }

    try {
        // Get the topic's categoryId, authorId, and title
        const topic = await query<RowDataPacket[]>(
            'SELECT categoryId, authorId, title FROM forum_posts WHERE id = ?',
            [topicId]
        )

        if (!topic[0]) return { error: 'Topic not found' }

        const replyId = `reply_${Date.now()}`

        // Get reply-to post info if this is a nested reply
        let replyToAuthorId: string | null = null
        let replyToContent: string | null = null
        if (replyToId) {
            const replyToPost = await query<RowDataPacket[]>(
                'SELECT authorId, content FROM forum_posts WHERE id = ?',
                [replyToId]
            )
            if (replyToPost[0]) {
                replyToAuthorId = replyToPost[0].authorId
                replyToContent = replyToPost[0].content
            }
        }

        // Insert the reply
        await query(
            `INSERT INTO forum_posts (id, content, categoryId, authorId, parentId, replyToId, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [replyId, content, topic[0].categoryId, session.userId, topicId, replyToId || null]
        )

        // Update topic's updatedAt
        await query(
            'UPDATE forum_posts SET updatedAt = NOW() WHERE id = ?',
            [topicId]
        )

        // Get current user's name for notifications
        const currentUser = await query<RowDataPacket[]>(
            `SELECT COALESCE(sp.fullName, u.militaryId) as displayName
             FROM users u LEFT JOIN student_profiles sp ON u.id = sp.userId
             WHERE u.id = ?`,
            [session.userId]
        )
        const senderName = currentUser[0]?.displayName || 'Someone'

        // ============== NOTIFICATIONS ==============

        // 1. Notify topic owner: "Someone replied in your post"
        if (topic[0].authorId !== session.userId) {
            const ownerMuted = await isNotificationMuted(topic[0].authorId, topicId, 'muteTopicReplies')
            if (!ownerMuted) {
                await createNotification(
                    topic[0].authorId,
                    'FORUM_REPLY',
                    'New Reply in Your Topic',
                    `${senderName} replied in your topic: "${topic[0].title?.slice(0, 40)}..."`,
                    `/forums/topic/${topicId}`
                )
            }
        }

        // 2. Notify all previous repliers: "Someone replied in a post you commented on"
        const previousRepliers = await query<RowDataPacket[]>(
            `SELECT DISTINCT authorId FROM forum_posts 
             WHERE parentId = ? AND authorId != ? AND authorId != ?`,
            [topicId, session.userId, topic[0].authorId]
        )

        for (const replier of previousRepliers) {
            const replierMuted = await isNotificationMuted(replier.authorId, topicId, 'muteThreadReplies')
            if (!replierMuted) {
                await createNotification(
                    replier.authorId,
                    'FORUM_THREAD_REPLY',
                    'New Reply in Thread',
                    `${senderName} replied in a thread you commented on: "${topic[0].title?.slice(0, 40)}..."`,
                    `/forums/topic/${topicId}`
                )
            }
        }

        // 3. Notify quoted reply author: "{student name} quoted your reply"
        if (replyToAuthorId && replyToAuthorId !== session.userId) {
            const quoteMuted = await isNotificationMuted(replyToAuthorId, topicId, 'muteQuoteReplies')
            if (!quoteMuted) {
                await createNotification(
                    replyToAuthorId,
                    'FORUM_QUOTE',
                    'Someone Quoted Your Reply',
                    `${senderName} quoted your reply: "${replyToContent?.slice(0, 40)}..."`,
                    `/forums/topic/${topicId}`
                )
            }
        }

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

// ============== MUTE SETTINGS ==============

export async function getMuteSettings(topicId: string) {
    const session = await getSession()
    if (!session.isLoggedIn) return null

    try {
        const settings = await query<RowDataPacket[]>(
            `SELECT muteTopicReplies, muteThreadReplies, muteQuoteReplies 
             FROM forum_mute_settings WHERE userId = ? AND postId = ?`,
            [session.userId, topicId]
        )
        return settings[0] || { muteTopicReplies: false, muteThreadReplies: false, muteQuoteReplies: false }
    } catch (error) {
        console.error('Get mute settings error:', error)
        return { muteTopicReplies: false, muteThreadReplies: false, muteQuoteReplies: false }
    }
}

export async function updateMuteSettings(topicId: string, setting: string, value: boolean) {
    const session = await getSession()
    if (!session.isLoggedIn) return { error: 'Not authenticated' }

    const validSettings = ['muteTopicReplies', 'muteThreadReplies', 'muteQuoteReplies']
    if (!validSettings.includes(setting)) {
        return { error: 'Invalid setting' }
    }

    try {
        const settingId = `mute_${session.userId}_${topicId}`

        // Upsert mute setting
        await query(
            `INSERT INTO forum_mute_settings (id, userId, postId, ${setting}, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, NOW(), NOW())
             ON DUPLICATE KEY UPDATE ${setting} = ?, updatedAt = NOW()`,
            [settingId, session.userId, topicId, value, value]
        )

        return { success: true }
    } catch (error) {
        console.error('Update mute settings error:', error)
        return { error: 'Failed to update settings' }
    }
}

// ============== HELPER FUNCTIONS ==============

async function isNotificationMuted(userId: string, topicId: string, settingField: string): Promise<boolean> {
    try {
        const settings = await query<RowDataPacket[]>(
            `SELECT ${settingField} as muted FROM forum_mute_settings WHERE userId = ? AND postId = ?`,
            [userId, topicId]
        )
        return settings[0]?.muted === 1 || settings[0]?.muted === true
    } catch (error) {
        return false // If error, don't mute (fail open)
    }
}

async function createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    link: string
) {
    try {
        const notifId = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        await query(
            `INSERT INTO notifications (id, userId, type, title, message, link, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [notifId, userId, type, title, message, link]
        )
    } catch (error) {
        console.error('Failed to create notification:', error)
    }
}
