'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcrypt'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { RowDataPacket } from '@/lib/types'
import { randomBytes } from 'crypto'

interface User extends RowDataPacket {
    id: string
    militaryId: string
    email: string
    password: string
    role: string
    isActive: number
    sessionVersion: number
}

// ---------------------------------------------------------------- brute-force protection
const MAX_ATTEMPTS = 5
const LOCK_MS = 15 * 60 * 1000
const failures = new Map<string, { count: number; lockedUntil: number }>()

function lockedFor(key: string) {
    const entry = failures.get(key)
    if (!entry) return 0
    const remaining = entry.lockedUntil - Date.now()
    if (remaining <= 0 && entry.lockedUntil) {
        failures.delete(key)
        return 0
    }
    return Math.max(0, remaining)
}

function recordFailure(key: string) {
    const entry = failures.get(key) || { count: 0, lockedUntil: 0 }
    entry.count += 1
    if (entry.count >= MAX_ATTEMPTS) entry.lockedUntil = Date.now() + LOCK_MS
    failures.set(key, entry)
}

// bcrypt work is done even for unknown accounts so response time doesn't reveal which IDs exist.
const DUMMY_HASH = bcrypt.hashSync(randomBytes(16).toString('hex'), 10)

function homeFor(role: string) {
    if (role === 'ADMIN') return '/admin'
    if (role === 'STAFF') return '/staff'
    return '/'
}

// Only allow returning to a path on this site.
function safeNext(next: string | null) {
    if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/login')) return null
    return next
}

export async function loginUser(formData: FormData) {
    const identifier = String(formData.get('militaryId') || '').trim()
    const password = String(formData.get('password') || '')
    const next = safeNext(formData.get('next') as string | null)

    if (!identifier || !password) {
        return { error: 'Enter your military ID and password' }
    }

    const ip = ((await headers()).get('x-forwarded-for') || '').split(',')[0].trim() || 'local'
    const keys = [`id:${identifier.toLowerCase()}`, `ip:${ip}`]
    const wait = Math.max(...keys.map(lockedFor))
    if (wait > 0) {
        return { error: `Too many failed attempts. Try again in ${Math.ceil(wait / 60000)} minutes.` }
    }

    try {
        const users = await query<User[]>(
            'SELECT * FROM users WHERE militaryId = ? OR lower(email) = lower(?) LIMIT 1',
            [identifier, identifier]
        )
        const user = users[0]
        const valid = await bcrypt.compare(password, user?.password || DUMMY_HASH)

        if (!user || !valid) {
            keys.forEach(recordFailure)
            return { error: 'Incorrect military ID or password' }
        }
        if (!user.isActive) {
            return { error: 'This account has been deactivated. Please contact the club administrator.' }
        }

        keys.forEach(k => failures.delete(k))

        const session = await getSession()
        session.userId = user.id
        session.militaryId = user.militaryId
        session.email = user.email
        session.role = user.role
        session.sessionVersion = Number(user.sessionVersion) || 0
        session.isLoggedIn = true
        await session.save()

        return { success: true, redirectTo: next || homeFor(user.role) }
    } catch (error) {
        console.error('Login error:', error)
        return { error: 'An error occurred during login. Please try again.' }
    }
}

export async function logoutUser() {
    const session = await getSession()
    session.destroy()
    redirect('/login')
}

export async function getDepartmentsAndProgrammes() {
    try {
        const departments = await query<RowDataPacket[]>('SELECT id, name, code FROM departments ORDER BY name')
        const programmes = await query<RowDataPacket[]>('SELECT id, name, code, departmentId FROM programmes ORDER BY name')
        return { departments, programmes }
    } catch (error) {
        console.error('Get departments error:', error)
        return { departments: [], programmes: [] }
    }
}

export async function registerUser(formData: FormData) {
    const militaryId = String(formData.get('militaryId') || '').trim()
    const email = String(formData.get('email') || '').trim().toLowerCase()
    const password = String(formData.get('password') || '')
    const confirmPassword = String(formData.get('confirmPassword') || '')
    const fullName = String(formData.get('fullName') || '').trim()
    const departmentId = String(formData.get('departmentId') || '')
    const programmeId = String(formData.get('programmeId') || '')
    const yearLevel = String(formData.get('yearLevel') || '')

    if (!militaryId || !email || !password || !fullName || !departmentId || !programmeId) {
        return { error: 'All required fields must be filled in' }
    }
    if (!/^[A-Za-z0-9-]{3,20}$/.test(militaryId)) {
        return { error: 'Military ID can only contain letters, numbers and dashes' }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: 'Please enter a valid email address' }
    }
    if (fullName.length < 3 || fullName.length > 100) {
        return { error: 'Please enter your full name' }
    }
    const passwordError = checkPasswordStrength(password)
    if (passwordError) return { error: passwordError }
    if (password !== confirmPassword) {
        return { error: 'Passwords do not match' }
    }

    try {
        const existing = await query<User[]>('SELECT id FROM users WHERE militaryId = ? OR lower(email) = ?', [militaryId, email])
        if (existing.length > 0) {
            return { error: 'An account with this military ID or email already exists' }
        }
        const programme = await query<RowDataPacket[]>('SELECT id FROM programmes WHERE id = ? AND departmentId = ?', [programmeId, departmentId])
        if (programme.length === 0) {
            return { error: 'Please choose a programme from your department' }
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const userId = `usr_${Date.now()}_${randomBytes(3).toString('hex')}`

        await query(
            `INSERT INTO users (id, militaryId, email, password, role, isActive, sessionVersion, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, 'STUDENT', 1, 0, NOW(), NOW())`,
            [userId, militaryId, email, hashedPassword]
        )
        await query(
            `INSERT INTO student_profiles (id, userId, fullName, departmentId, programmeId, yearLevel, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [`sp_${Date.now()}_${randomBytes(3).toString('hex')}`, userId, fullName, departmentId, programmeId, yearLevel || null]
        )

        const session = await getSession()
        session.userId = userId
        session.militaryId = militaryId
        session.email = email
        session.role = 'STUDENT'
        session.sessionVersion = 0
        session.isLoggedIn = true
        await session.save()

        try {
            await query(
                `INSERT INTO audit_logs (id, userId, action, tableName, recordId, newData, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [`log_${Date.now()}`, userId, 'USER_REGISTERED', 'users', userId, JSON.stringify({ militaryId, fullName, departmentId })]
            )
        } catch { /* audit log is non-critical */ }

        return { success: true }
    } catch (error) {
        console.error('Registration error:', error)
        return { error: 'An error occurred during registration' }
    }
}

function checkPasswordStrength(password: string): string | null {
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Password must contain both letters and numbers'
    return null
}
