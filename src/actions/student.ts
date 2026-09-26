'use server'

import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { RowDataPacket } from '@/lib/types'

// Helper to get profile ID
async function getProfileId(userId: string) {
    const profiles = await query<RowDataPacket[]>('SELECT id FROM student_profiles WHERE userId = ?', [userId])
    return profiles[0]?.id
}

// Student profile update actions could go here if we add edit functionality for the base profile info (bio, etc.)
// Currently, the requested features (experience, training, etc.) are removed.
