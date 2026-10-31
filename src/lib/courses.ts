// Shared by the courses pages (server) and the course form (client).

export const COURSE_FIELDS = {
    AI: { label: 'Artificial Intelligence', icon: 'fa-brain', color: '#7c3aed', bg: '#f3e8ff' },
    CYBERSECURITY: { label: 'Cybersecurity', icon: 'fa-shield-halved', color: '#b91c1c', bg: '#fee2e2' },
    PROGRAMMING: { label: 'Programming', icon: 'fa-code', color: '#1d4ed8', bg: '#e0ecff' },
    ELECTRONICS: { label: 'Electronics', icon: 'fa-microchip', color: '#047857', bg: '#dcfce7' },
    ROBOTICS: { label: 'Robotics', icon: 'fa-robot', color: '#0f766e', bg: '#ccfbf1' },
    IOT: { label: 'Internet of Things', icon: 'fa-wifi', color: '#0369a1', bg: '#e0f2fe' },
    FABRICATION: { label: '3D Printing & Fabrication', icon: 'fa-cube', color: '#b45309', bg: '#fef3c7' },
    DRONES: { label: 'Drones', icon: 'fa-plane-up', color: '#4338ca', bg: '#e0e7ff' },
    SUSTAINABILITY: { label: 'Sustainability', icon: 'fa-leaf', color: '#15803d', bg: '#dcfce7' },
    OTHER: { label: 'Other', icon: 'fa-layer-group', color: '#6f6224', bg: '#f7f3e1' },
} as const

export type CourseField = keyof typeof COURSE_FIELDS
export const COURSE_FIELD_KEYS = Object.keys(COURSE_FIELDS) as CourseField[]

export const COURSE_KINDS = {
    COURSE: { label: 'Course', icon: 'fa-graduation-cap' },
    WORKSHOP: { label: 'Workshop', icon: 'fa-screwdriver-wrench' },
} as const

export type CourseKind = keyof typeof COURSE_KINDS

export function isCourseField(value: unknown): value is CourseField {
    return COURSE_FIELD_KEYS.includes(value as CourseField)
}

export function isCourseKind(value: unknown): value is CourseKind {
    return value === 'COURSE' || value === 'WORKSHOP'
}

export interface VideoInfo {
    provider: 'youtube' | 'drive'
    id: string
    embedUrl: string
    watchUrl: string
    thumbnail: string | null
}

// Accepts the usual YouTube and Google Drive share links and returns safe,
// canonical embed and watch URLs built from the extracted ID only.
export function parseVideo(raw: string): VideoInfo | null {
    let url: URL
    try {
        url = new URL(String(raw || '').trim())
    } catch {
        return null
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    const host = url.hostname.replace(/^www\.|^m\./, '')
    const validYoutubeId = (id: string | null | undefined) => (id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null)

    let youtubeId: string | null = null
    if (host === 'youtu.be') {
        youtubeId = validYoutubeId(url.pathname.split('/')[1])
    } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        if (url.pathname === '/watch') youtubeId = validYoutubeId(url.searchParams.get('v'))
        else {
            const match = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/)
            youtubeId = validYoutubeId(match?.[1])
        }
    }
    if (youtubeId) {
        return {
            provider: 'youtube',
            id: youtubeId,
            embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}`,
            watchUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
            thumbnail: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
        }
    }

    if (host === 'drive.google.com') {
        const fromPath = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]{10,})/)?.[1]
        const fromQuery = url.searchParams.get('id')
        const driveId = fromPath || (fromQuery && /^[A-Za-z0-9_-]{10,}$/.test(fromQuery) ? fromQuery : null)
        if (driveId) {
            return {
                provider: 'drive',
                id: driveId,
                embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
                watchUrl: `https://drive.google.com/file/d/${driveId}/view`,
                thumbnail: null,
            }
        }
    }
    return null
}
