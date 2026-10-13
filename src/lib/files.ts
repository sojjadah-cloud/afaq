import { randomBytes } from 'crypto'
import { query } from './db'

// Uploaded files live in the SQLite database so they work on hosts without a
// persistent or public filesystem; they are served by /api/files/[id].

export const MAX_UPLOAD_MB = 25
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024

export const FORM_EXTENSIONS = ['pdf', 'doc', 'docx']
export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp']
export const ATTACHMENT_EXTENSIONS = [...FORM_EXTENSIONS, 'ppt', 'pptx', 'xls', 'xlsx', 'zip', ...IMAGE_EXTENSIONS]

const MIME: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    zip: 'application/zip',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
}

// Leading bytes each format must start with, so a renamed file can't pass as another type.
const OLE = [0xd0, 0xcf, 0x11, 0xe0]
const ZIP = [0x50, 0x4b]
const SIGNATURES: Record<string, number[][]> = {
    pdf: [[0x25, 0x50, 0x44, 0x46]],
    doc: [OLE], ppt: [OLE], xls: [OLE],
    docx: [ZIP], pptx: [ZIP], xlsx: [ZIP], zip: [ZIP],
    png: [[0x89, 0x50, 0x4e, 0x47]],
    jpg: [[0xff, 0xd8, 0xff]], jpeg: [[0xff, 0xd8, 0xff]],
    gif: [[0x47, 0x49, 0x46, 0x38]],
    webp: [[0x52, 0x49, 0x46, 0x46]],
}

function extensionOf(name: string) {
    return (name.split('.').pop() || '').toLowerCase()
}

function cleanName(name: string) {
    const base = name.split(/[\\/]/).pop() || 'file'
    return base.replace(/[^\p{L}\p{N} ._()-]/gu, '').trim().slice(0, 150) || 'file'
}

export type SavedFile = { id: string; url: string; name: string; isImage: boolean }

export async function saveUpload(
    file: File | null,
    opts: { allowed: string[]; userId?: string; label?: string }
): Promise<SavedFile | { error: string }> {
    const label = opts.label || 'File'
    if (!file || typeof file === 'string' || file.size === 0) {
        return { error: `${label} is required` }
    }
    if (file.size > MAX_UPLOAD_BYTES) {
        return { error: `${label} is too large. Maximum size is ${MAX_UPLOAD_MB} MB.` }
    }

    const ext = extensionOf(file.name)
    if (!opts.allowed.includes(ext)) {
        return { error: `${label} must be one of: ${opts.allowed.map(e => '.' + e).join(', ')}` }
    }

    const data = Buffer.from(await file.arrayBuffer())
    const matches = (SIGNATURES[ext] || []).some(sig => sig.every((b, i) => data[i] === b))
    if (!matches) {
        return { error: `${label} does not look like a valid .${ext} file` }
    }

    const id = `file_${Date.now()}_${randomBytes(6).toString('hex')}`
    const name = cleanName(file.name)
    await query(
        'INSERT INTO files (id, name, mimeType, size, data, uploadedById, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [id, name, MIME[ext], data.length, data, opts.userId || null]
    )
    return { id, url: `/api/files/${id}`, name, isImage: IMAGE_EXTENSIONS.includes(ext) }
}
