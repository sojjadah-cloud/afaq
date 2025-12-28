'use server'

import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function uploadImage(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) {
        return { error: 'No file uploaded' }
    }

    // 1. Validate File Type (Allow only images)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
        return { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }
    }

    // 2. Validate File Size (Max 50MB)
    const maxSize = 10 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
        return { error: 'File too large. Maximum size is 5MB.' }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 3. Sanitize filename (Keep extension safe)
    const extension = file.name.split('.').pop()?.toLowerCase() || 'png'
    // Double check extension against allowed list
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    if (!allowedExtensions.includes(extension)) {
        return { error: 'Invalid file extension' }
    }

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, '')}.${extension}`
    const path = join(process.cwd(), 'public', 'uploads', filename)

    try {
        await writeFile(path, buffer)
        return { url: `/uploads/${filename}` }
    } catch (error) {
        console.error('Upload error:', error)
        return { error: 'Failed to upload image' }
    }
}
