'use server'

import bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { getActiveUser } from '@/lib/session'
import { RowDataPacket } from '@/lib/types'
import { todayInOman } from '@/lib/utils'

const text = (fd: FormData, key: string) => String(fd.get(key) || '').trim()

export async function updateProfile(formData: FormData) {
    const session = await getSession()
    const user = await getActiveUser(session)
    if (!user) return { error: 'Not authenticated' }

    const fullName = text(formData, 'fullName')
    const phone = text(formData, 'phone')
    const bio = text(formData, 'bio')
    const departmentId = text(formData, 'departmentId')
    const programmeId = text(formData, 'programmeId')
    const yearLevel = text(formData, 'yearLevel')

    if (fullName.length < 3 || fullName.length > 100) return { error: 'Enter your full name' }
    if (phone && !/^[+\d][\d\s-]{6,19}$/.test(phone)) return { error: 'Enter a valid phone number' }
    if (bio.length > 500) return { error: 'Keep the bio under 500 characters' }
    if (yearLevel && !['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Graduate'].includes(yearLevel)) return { error: 'Choose a valid year level' }

    const dept = await query<RowDataPacket[]>('SELECT id FROM departments WHERE id = ?', [departmentId])
    if (!dept.length) return { error: 'Choose your department' }
    if (programmeId) {
        const prog = await query<RowDataPacket[]>('SELECT id FROM programmes WHERE id = ? AND departmentId = ?', [programmeId, departmentId])
        if (!prog.length) return { error: 'Choose a programme from your department' }
    } else if (user.role === 'STUDENT') {
        return { error: 'Choose your programme' }
    }

    const existing = await query<RowDataPacket[]>('SELECT id FROM student_profiles WHERE userId = ?', [user.id])
    if (existing.length) {
        await query(
            `UPDATE student_profiles SET fullName = ?, phone = ?, bio = ?, departmentId = ?, programmeId = ?, yearLevel = ?, updatedAt = NOW()
             WHERE userId = ?`,
            [fullName, phone || null, bio || null, departmentId, programmeId, yearLevel || null, user.id]
        )
    } else {
        await query(
            `INSERT INTO student_profiles (id, userId, fullName, phone, bio, departmentId, programmeId, yearLevel, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [`sp_${Date.now()}_${randomBytes(3).toString('hex')}`, user.id, fullName, phone || null, bio || null, departmentId, programmeId, yearLevel || null]
        )
    }
    revalidatePath('/student')
    return { success: true }
}

export async function changePassword(formData: FormData) {
    const session = await getSession()
    const user = await getActiveUser(session)
    if (!user) return { error: 'Not authenticated' }

    const current = String(formData.get('currentPassword') || '')
    const next = String(formData.get('newPassword') || '')
    const confirm = String(formData.get('confirmPassword') || '')

    if (next.length < 8) return { error: 'The new password must be at least 8 characters' }
    if (!/[A-Za-z]/.test(next) || !/\d/.test(next)) return { error: 'The new password must contain both letters and numbers' }
    if (next !== confirm) return { error: 'The new passwords do not match' }
    if (next === current) return { error: 'Choose a password different from the current one' }

    const rows = await query<RowDataPacket[]>('SELECT password, sessionVersion FROM users WHERE id = ?', [user.id])
    if (!rows[0] || !(await bcrypt.compare(current, rows[0].password))) {
        return { error: 'Your current password is incorrect' }
    }

    const version = (Number(rows[0].sessionVersion) || 0) + 1
    await query('UPDATE users SET password = ?, sessionVersion = ?, updatedAt = NOW() WHERE id = ?', [await bcrypt.hash(next, 10), version, user.id])

    // Sign out other devices but keep this session.
    session.sessionVersion = version
    await session.save()
    return { success: true }
}

export async function cancelMyBooking(bookingId: string) {
    const session = await getSession()
    const user = await getActiveUser(session)
    if (!user) return { error: 'Not authenticated' }

    const rows = await query<RowDataPacket[]>('SELECT userId, status, bookingDate FROM lab_bookings WHERE id = ?', [bookingId])
    const booking = rows[0]
    if (!booking || booking.userId !== user.id) return { error: 'Booking not found' }
    if (!['PENDING', 'APPROVED'].includes(booking.status)) return { error: 'Only pending or approved bookings can be cancelled' }
    if (String(booking.bookingDate).slice(0, 10) < todayInOman()) return { error: 'Past bookings cannot be cancelled' }

    await query("UPDATE lab_bookings SET status = 'CANCELLED', updatedAt = NOW() WHERE id = ?", [bookingId])
    revalidatePath('/student')
    revalidatePath('/admin/bookings')
    return { success: true }
}
