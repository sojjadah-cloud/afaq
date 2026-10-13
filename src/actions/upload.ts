'use server'

import { getSession } from '@/lib/auth'
import { saveUpload, IMAGE_EXTENSIONS } from '@/lib/files'

export async function uploadImage(formData: FormData) {
    const session = await getSession()
    if (!session.isLoggedIn) {
        return { error: 'Not authenticated' }
    }

    try {
        const saved = await saveUpload(formData.get('file') as File | null, {
            allowed: IMAGE_EXTENSIONS,
            userId: session.userId,
            label: 'Image',
        })
        if ('error' in saved) return { error: saved.error }
        return { url: saved.url }
    } catch (error) {
        console.error('Upload error:', error)
        return { error: 'Failed to upload image' }
    }
}
