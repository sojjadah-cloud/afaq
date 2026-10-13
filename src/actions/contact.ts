'use server'

import { query } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

async function isStaff() {
    const session = await getSession()
    return session.isLoggedIn && (session.role === 'STAFF' || session.role === 'ADMIN')
}

export async function submitContactMessage(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    if (!name || !email || !subject || !message) {
        return { error: 'Please fill in all required fields' }
    }

    try {
        const contactId = `contact_${Date.now()}`

        await query(
            `INSERT INTO contact_messages 
             (id, name, email, phone, subject, message, status, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, 'NEW', NOW())`,
            [contactId, name, email, phone || null, subject, message]
        )

        revalidatePath('/contact')
        return { success: true, message: 'Your message has been sent! We will get back to you soon.' }
    } catch (error) {
        console.error('Contact message error:', error)
        return { error: 'Failed to send message. Please try again.' }
    }
}

export async function getContactMessages() {
    if (!(await isStaff())) return []
    try {
        const messages = await query<any[]>(`
            SELECT * FROM contact_messages
            ORDER BY createdAt DESC
        `)
        return messages
    } catch (error) {
        console.error('Get contact messages error:', error)
        return []
    }
}

export async function updateContactStatus(messageId: string, status: 'READ' | 'REPLIED' | 'CLOSED') {
    if (!(await isStaff())) return { error: 'Not authorized' }
    if (!['READ', 'REPLIED', 'CLOSED'].includes(status)) return { error: 'Invalid status' }
    try {
        await query(
            'UPDATE contact_messages SET status = ?, updatedAt = NOW() WHERE id = ?',
            [status, messageId]
        )
        revalidatePath('/admin/requests')
        return { success: true }
    } catch (error) {
        console.error('Update contact status error:', error)
        return { error: 'Failed to update status' }
    }
}
