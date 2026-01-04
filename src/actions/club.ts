'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function submitClubRegistration(formData: FormData) {
    const session = await getSession()

    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const militaryId = formData.get('militaryId') as string
    const department = formData.get('department') as string
    const yearLevel = formData.get('yearLevel') as string
    const interests = formData.get('interests') as string
    const motivation = formData.get('motivation') as string

    if (!fullName || !email || !militaryId || !department) {
        return { error: 'Please fill in all required fields' }
    }

    try {
        const registrationId = `reg_${Date.now()}`

        await query(
            `INSERT INTO club_registrations 
             (id, fullName, email, phone, militaryId, department, yearLevel, interests, motivation, userId, status, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW())`,
            [registrationId, fullName, email, phone || null, militaryId, department, yearLevel || null, interests || null, motivation || null, session.userId || null]
        )

        revalidatePath('/about')
        return { success: true, message: 'Your registration has been submitted! We will contact you soon.' }
    } catch (error) {
        console.error('Club registration error:', error)
        return { error: 'Failed to submit registration. Please try again.' }
    }
}

export async function getClubRegistrations() {
    const session = await getSession()
    if (!session.isLoggedIn || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
        return []
    }

    try {
        const registrations = await query<any[]>(`
            SELECT * FROM club_registrations
            ORDER BY createdAt DESC
        `)
        return registrations
    } catch (error) {
        console.error('Get registrations error:', error)
        return []
    }
}

export async function updateRegistrationStatus(registrationId: string, status: 'APPROVED' | 'REJECTED') {
    const session = await getSession()
    if (!session.isLoggedIn || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
        return { error: 'Not authorized' }
    }

    try {
        await query(
            'UPDATE club_registrations SET status = ?, updatedAt = NOW() WHERE id = ?',
            [status, registrationId]
        )
        revalidatePath('/about')
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        console.error('Update registration error:', error)
        return { error: 'Failed to update registration' }
    }
}
