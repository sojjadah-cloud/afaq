'use server'

import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary (only if credentials are available)
if (process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })
}

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

    // 2. Validate File Size (Max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
        return { error: 'File too large. Maximum size is 10MB.' }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 3. Sanitize filename (Keep extension safe)
    const extension = file.name.split('.').pop()?.toLowerCase() || 'png'
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    if (!allowedExtensions.includes(extension)) {
        return { error: 'Invalid file extension' }
    }

    try {
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL
        const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET

        let url: string

        // Use Cloudinary in production if configured
        if (isProduction && hasCloudinary) {
            // Upload to Cloudinary
            const base64File = `data:${file.type};base64,${buffer.toString('base64')}`

            const uploadResult = await cloudinary.uploader.upload(base64File, {
                folder: 'afaq-innovation',
                resource_type: 'image',
                public_id: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`,
            })

            url = uploadResult.secure_url
        } else if (isProduction && !hasCloudinary) {
            // Production but no cloud storage configured
            return {
                error: 'Image uploads require cloud storage. Please configure Cloudinary environment variables in Vercel.'
            }
        } else {
            // Local development: save to public/uploads
            const { mkdir } = await import('fs/promises')
            const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}.${extension}`
            const uploadsDir = join(process.cwd(), 'public', 'uploads')

            await mkdir(uploadsDir, { recursive: true })

            const path = join(uploadsDir, filename)
            await writeFile(path, buffer)
            url = `/uploads/${filename}`
        }

        return { url }
    } catch (error) {
        console.error('Upload error:', error)
        return { error: 'Failed to upload image. ' + (error instanceof Error ? error.message : 'Unknown error') }
    }
}
