'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcrypt'
import { redirect } from 'next/navigation'
import { RowDataPacket } from 'mysql2'

interface User extends RowDataPacket {
    id: string
    militaryId: string
    email: string
    password: string
    role: string
}

export async function loginUser(formData: FormData) {
    const militaryId = formData.get('militaryId') as string
    const password = formData.get('password') as string

    if (!militaryId || !password) {
        return { error: 'Military ID and password are required' }
    }

    try {
        // Find user by military ID
        const users = await query<User[]>('SELECT * FROM users WHERE militaryId = ?', [militaryId])
        const user = users[0]

        if (!user) {
            return { error: 'Invalid military ID or password' }
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
            return { error: 'Invalid military ID or password' }
        }

        // Create session
        const session = await getSession()
        session.userId = user.id
        session.militaryId = user.militaryId
        session.email = user.email
        session.role = user.role
        session.isLoggedIn = true
        await session.save()

        return { success: true }
    } catch (error) {
        console.error('Login error:', error)
        return { error: 'An error occurred during login' }
    }
}

export async function logoutUser() {
    const session = await getSession()
    session.destroy()
    redirect('/login')
}

export async function getCurrentUser() {
    const session = await getSession()

    if (!session.isLoggedIn) {
        return null
    }

    const users = await query<User[]>('SELECT * FROM users WHERE id = ?', [session.userId])
    const user = users[0]

    if (!user) return null

    // Fetch profile and related data manually since we don't have ORM includes
    // For basic header display, just user data is enough. 
    // Full profile fetching would require more queries JOINing tables.
    // Simplifying here to just return user info for now.

    return user
}

export async function registerUser(formData: FormData) {
    const militaryId = formData.get('militaryId') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const fullName = formData.get('fullName') as string

    // Validation
    if (!militaryId || !email || !password || !fullName) {
        return { error: 'All fields are required' }
    }

    if (password.length < 6) {
        return { error: 'Password must be at least 6 characters' }
    }

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match' }
    }

    try {
        // Check if user already exists
        const existing = await query<User[]>('SELECT * FROM users WHERE militaryId = ? OR email = ?', [militaryId, email])
        if (existing.length > 0) {
            return { error: 'User with this Military ID or email already exists' }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)
        const userId = `usr_${Date.now()}`

        // Create user
        await query(
            `INSERT INTO users (id, militaryId, email, password, role, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, 'STUDENT', NOW(), NOW())`,
            [userId, militaryId, email, hashedPassword]
        )

        // Create student profile
        await query(
            `INSERT INTO student_profiles (id, userId, fullName, createdAt, updatedAt)
             VALUES (?, ?, ?, NOW(), NOW())`,
            [`sp_${Date.now()}`, userId, fullName]
        )

        // Auto-login the user
        const session = await getSession()
        session.userId = userId
        session.militaryId = militaryId
        session.email = email
        session.role = 'STUDENT'
        session.isLoggedIn = true
        await session.save()

        return { success: true }
    } catch (error) {
        console.error('Registration error:', error)
        return { error: 'An error occurred during registration' }
    }
}

