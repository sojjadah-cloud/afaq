'use server'

import bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { getActiveUser } from '@/lib/session'
import { RowDataPacket } from '@/lib/types'

const ROLES = ['STUDENT', 'STAFF', 'ADMIN']

async function requireRole(roles: string[]) {
    const session = await getSession()
    const user = await getActiveUser(session)
    if (!user || !roles.includes(user.role)) return null
    return user
}

async function audit(userId: string, action: string, tableName: string, recordId: string, data?: unknown) {
    try {
        await query(
            `INSERT INTO audit_logs (id, userId, action, tableName, recordId, newData, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [`log_${Date.now()}_${randomBytes(3).toString('hex')}`, userId, action, tableName, recordId, data ? JSON.stringify(data) : null]
        )
    } catch { /* audit log is non-critical */ }
}

function temporaryPassword() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
    let out = ''
    for (const b of randomBytes(10)) out += alphabet[b % alphabet.length]
    return `${out.slice(0, 5)}-${out.slice(5)}4`
}

const text = (fd: FormData, key: string) => String(fd.get(key) || '').trim()

// ================================================================ users

export async function createUserAccount(formData: FormData) {
    const admin = await requireRole(['ADMIN'])
    if (!admin) return { error: 'Not authorized' }

    const fullName = text(formData, 'fullName')
    const militaryId = text(formData, 'militaryId')
    const email = text(formData, 'email').toLowerCase()
    const role = text(formData, 'role')
    const departmentId = text(formData, 'departmentId')
    const programmeId = text(formData, 'programmeId')

    if (fullName.length < 3) return { error: 'Enter the full name' }
    if (!/^[A-Za-z0-9-]{3,20}$/.test(militaryId)) return { error: 'Military ID can only contain letters, numbers and dashes' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address' }
    if (!ROLES.includes(role)) return { error: 'Choose a role' }

    const dept = await query<RowDataPacket[]>('SELECT id FROM departments WHERE id = ?', [departmentId])
    if (!dept.length) return { error: 'Choose a department' }
    if (programmeId) {
        const prog = await query<RowDataPacket[]>('SELECT id FROM programmes WHERE id = ? AND departmentId = ?', [programmeId, departmentId])
        if (!prog.length) return { error: 'Choose a programme from the selected department' }
    } else if (role === 'STUDENT') {
        return { error: 'Students need a programme' }
    }

    const existing = await query<RowDataPacket[]>('SELECT id FROM users WHERE militaryId = ? OR lower(email) = ?', [militaryId, email])
    if (existing.length) return { error: 'A user with this military ID or email already exists' }

    const password = temporaryPassword()
    const userId = `usr_${Date.now()}_${randomBytes(3).toString('hex')}`
    try {
        await query(
            `INSERT INTO users (id, militaryId, email, password, role, isActive, sessionVersion, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, 1, 0, NOW(), NOW())`,
            [userId, militaryId, email, await bcrypt.hash(password, 10), role]
        )
        // Staff and administrators may have no programme; '' keeps the NOT NULL column valid.
        await query(
            `INSERT INTO student_profiles (id, userId, fullName, departmentId, programmeId, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [`sp_${Date.now()}_${randomBytes(3).toString('hex')}`, userId, fullName, departmentId, programmeId]
        )
    } catch (error) {
        console.error('Create user error:', error)
        await query('DELETE FROM users WHERE id = ?', [userId]).catch(() => {})
        return { error: 'Could not create the account. Please try again.' }
    }
    await audit(admin.id, 'USER_CREATED', 'users', userId, { militaryId, role })
    revalidatePath('/admin/users')
    return { success: true, password, militaryId }
}

export async function updateUserRole(userId: string, role: string) {
    const admin = await requireRole(['ADMIN'])
    if (!admin) return { error: 'Not authorized' }
    if (!ROLES.includes(role)) return { error: 'Invalid role' }
    if (userId === admin.id) return { error: 'You cannot change your own role' }

    await query('UPDATE users SET role = ?, sessionVersion = sessionVersion + 1, updatedAt = NOW() WHERE id = ?', [role, userId])
    await audit(admin.id, 'USER_ROLE_CHANGED', 'users', userId, { role })
    revalidatePath('/admin/users')
    return { success: true }
}

export async function setUserActive(userId: string, active: boolean) {
    const admin = await requireRole(['ADMIN'])
    if (!admin) return { error: 'Not authorized' }
    if (userId === admin.id) return { error: 'You cannot deactivate your own account' }

    await query('UPDATE users SET isActive = ?, sessionVersion = sessionVersion + 1, updatedAt = NOW() WHERE id = ?', [active ? 1 : 0, userId])
    await audit(admin.id, active ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', 'users', userId)
    revalidatePath('/admin/users')
    return { success: true }
}

export async function resetUserPassword(userId: string) {
    const admin = await requireRole(['ADMIN'])
    if (!admin) return { error: 'Not authorized' }

    const rows = await query<RowDataPacket[]>('SELECT militaryId FROM users WHERE id = ?', [userId])
    if (!rows[0]) return { error: 'User not found' }

    const password = temporaryPassword()
    await query(
        'UPDATE users SET password = ?, sessionVersion = sessionVersion + 1, updatedAt = NOW() WHERE id = ?',
        [await bcrypt.hash(password, 10), userId]
    )
    await audit(admin.id, 'USER_PASSWORD_RESET', 'users', userId)
    return { success: true, password, militaryId: rows[0].militaryId }
}

// ================================================================ equipment

export async function saveLabCategory(formData: FormData) {
    const user = await requireRole(['ADMIN', 'STAFF'])
    if (!user) return { error: 'Not authorized' }

    const id = text(formData, 'id')
    const label = text(formData, 'label')
    if (!id || label.length < 2) return { error: 'Enter a category name' }

    await query(
        `UPDATE lab_categories SET label = ?, description = ?, technician = ?, technicianContact = ?, updatedAt = NOW() WHERE id = ?`,
        [label, text(formData, 'description'), text(formData, 'technician') || null, text(formData, 'technicianContact') || null, id]
    )
    await audit(user.id, 'LAB_CATEGORY_UPDATED', 'lab_categories', id, { label })
    revalidatePath('/equipment')
    revalidatePath('/admin/equipment')
    return { success: true }
}

export async function saveLabItem(formData: FormData) {
    const user = await requireRole(['ADMIN', 'STAFF'])
    if (!user) return { error: 'Not authorized' }

    const id = text(formData, 'id')
    const name = text(formData, 'name')
    const categoryId = text(formData, 'categoryId')
    const capacity = parseInt(text(formData, 'capacity'), 10)
    const fields = [
        name,
        text(formData, 'shortDesc'),
        text(formData, 'tag') || 'General',
        categoryId,
        capacity,
        text(formData, 'location') || null,
        formData.get('isBookable') === 'on' ? 1 : 0,
    ]

    if (name.length < 2) return { error: 'Enter a name' }
    if (!Number.isFinite(capacity) || capacity < 1 || capacity > 1000) return { error: 'Capacity must be between 1 and 1000' }
    const category = await query<RowDataPacket[]>('SELECT id FROM lab_categories WHERE id = ?', [categoryId])
    if (!category.length) return { error: 'Choose a category' }

    if (id) {
        await query(
            `UPDATE labs SET name = ?, shortDesc = ?, tag = ?, categoryId = ?, capacity = ?, location = ?, isBookable = ?, updatedAt = NOW() WHERE id = ?`,
            [...fields, id]
        )
        await audit(user.id, 'LAB_UPDATED', 'labs', id, { name })
    } else {
        const newId = `lab_${Date.now()}_${randomBytes(3).toString('hex')}`
        await query(
            `INSERT INTO labs (id, name, shortDesc, tag, categoryId, capacity, location, isBookable, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [newId, ...fields]
        )
        await audit(user.id, 'LAB_CREATED', 'labs', newId, { name })
    }
    revalidatePath('/equipment')
    revalidatePath('/admin/equipment')
    return { success: true }
}

export async function deleteLabItem(labId: string) {
    const user = await requireRole(['ADMIN', 'STAFF'])
    if (!user) return { error: 'Not authorized' }

    const used = await query<RowDataPacket[]>('SELECT COUNT(*) as count FROM lab_bookings WHERE labId = ?', [labId])
    if (Number(used[0]?.count) > 0) {
        return { error: 'This item has booking history. Untick "Available for booking" to hide it instead.' }
    }
    await query('DELETE FROM labs WHERE id = ?', [labId])
    await audit(user.id, 'LAB_DELETED', 'labs', labId)
    revalidatePath('/equipment')
    revalidatePath('/admin/equipment')
    return { success: true }
}

// ================================================================ departments & programmes

export async function saveDepartment(formData: FormData) {
    const admin = await requireRole(['ADMIN'])
    if (!admin) return { error: 'Not authorized' }

    const id = text(formData, 'id')
    const name = text(formData, 'name')
    const description = text(formData, 'description')
    if (name.length < 3) return { error: 'Enter the department name' }

    if (id) {
        await query('UPDATE departments SET name = ?, description = ?, updatedAt = NOW() WHERE id = ?', [name, description, id])
        await audit(admin.id, 'DEPARTMENT_UPDATED', 'departments', id, { name })
    } else {
        const code = text(formData, 'code').toUpperCase()
        if (!/^[A-Z]{2,5}$/.test(code)) return { error: 'Code must be 2 to 5 letters (it is used in page links)' }
        if (code === 'CLUB') return { error: 'This code is reserved' }
        const clash = await query<RowDataPacket[]>('SELECT id FROM departments WHERE code = ?', [code])
        if (clash.length) return { error: 'Another department already uses this code' }
        const newId = `dept_${code.toLowerCase()}_${Date.now()}`
        await query(
            'INSERT INTO departments (id, name, code, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [newId, name, code, description]
        )
        await audit(admin.id, 'DEPARTMENT_CREATED', 'departments', newId, { name, code })
    }
    revalidatePath('/admin/departments')
    return { success: true }
}

export async function saveProgramme(formData: FormData) {
    const admin = await requireRole(['ADMIN'])
    if (!admin) return { error: 'Not authorized' }

    const id = text(formData, 'id')
    const name = text(formData, 'name')
    const code = text(formData, 'code').toUpperCase()
    const departmentId = text(formData, 'departmentId')
    const level = text(formData, 'level') || 'Bachelor'
    if (name.length < 3) return { error: 'Enter the programme name' }
    if (!/^[A-Z0-9-]{2,15}$/.test(code)) return { error: 'Code can only contain letters, numbers and dashes' }
    const dept = await query<RowDataPacket[]>('SELECT id FROM departments WHERE id = ?', [departmentId])
    if (!dept.length) return { error: 'Choose a department' }

    if (id) {
        await query('UPDATE programmes SET name = ?, code = ?, departmentId = ?, level = ?, updatedAt = NOW() WHERE id = ?', [name, code, departmentId, level, id])
    } else {
        await query(
            'INSERT INTO programmes (id, name, code, departmentId, level, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            [`prog_${Date.now()}_${randomBytes(3).toString('hex')}`, name, code, departmentId, level]
        )
    }
    await audit(admin.id, id ? 'PROGRAMME_UPDATED' : 'PROGRAMME_CREATED', 'programmes', id || code, { name })
    revalidatePath('/admin/departments')
    return { success: true }
}

export async function deleteProgramme(programmeId: string) {
    const admin = await requireRole(['ADMIN'])
    if (!admin) return { error: 'Not authorized' }
    const used = await query<RowDataPacket[]>('SELECT COUNT(*) as count FROM student_profiles WHERE programmeId = ?', [programmeId])
    if (Number(used[0]?.count) > 0) return { error: 'Students are enrolled in this programme, so it cannot be deleted' }
    await query('DELETE FROM programmes WHERE id = ?', [programmeId])
    await audit(admin.id, 'PROGRAMME_DELETED', 'programmes', programmeId)
    revalidatePath('/admin/departments')
    return { success: true }
}

// ================================================================ projects

export async function deleteProject(projectId: string) {
    const admin = await requireRole(['ADMIN'])
    if (!admin) return { error: 'Not authorized' }

    const rows = await query<RowDataPacket[]>('SELECT title FROM projects WHERE id = ?', [projectId])
    if (!rows[0]) return { error: 'Project not found' }

    const attachments = await query<RowDataPacket[]>('SELECT url FROM project_attachments WHERE projectId = ?', [projectId])
    for (const a of attachments) {
        const match = String(a.url).match(/^\/api\/files\/([\w-]+)$/)
        if (match) await query('DELETE FROM files WHERE id = ?', [match[1]])
    }
    await query('DELETE FROM project_attachments WHERE projectId = ?', [projectId])
    await query('DELETE FROM project_members WHERE projectId = ?', [projectId])
    await query('DELETE FROM projects WHERE id = ?', [projectId])
    await audit(admin.id, 'PROJECT_DELETED', 'projects', projectId, { title: rows[0].title })

    revalidatePath('/projects')
    return { success: true }
}
