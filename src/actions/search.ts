'use server'

import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'

export type SearchType = 'project' | 'research' | 'event' | 'lab' | 'news' | 'forum'

export interface SearchResult {
    type: SearchType
    id: string
    title: string
    href: string
    category?: string
}

const PER_TYPE = 4

// Escapes LIKE wildcards so a search for "100%" matches literally.
function likeTerm(text: string) {
    return `%${text.replace(/[\\%_]/g, c => `\\${c}`)}%`
}

export async function globalSearch(searchQuery: string): Promise<SearchResult[]> {
    const text = String(searchQuery || '').trim().slice(0, 100)
    if (text.length < 2) return []

    const term = likeTerm(text)
    const like = (column: string) => `${column} LIKE ? ESCAPE '\\'`

    try {
        const [projects, research, events, labs, news, topics] = await Promise.all([
            // Same visibility as the project pages: rejected projects are not listed.
            query<RowDataPacket[]>(
                `SELECT id, title, category FROM projects
                 WHERE status IN ('START', 'PENDING_APPROVAL', 'DEVELOPMENT', 'PENDING_COMPLETION', 'COMPLETED')
                   AND (${like('title')} OR ${like('description')} OR ${like('category')})
                 ORDER BY updatedAt DESC LIMIT ${PER_TYPE}`,
                [term, term, term]
            ),
            query<RowDataPacket[]>(
                `SELECT id, title, category FROM research
                 WHERE ${like('title')} OR ${like('abstract')} OR ${like('authors')}
                 LIMIT ${PER_TYPE}`,
                [term, term, term]
            ),
            query<RowDataPacket[]>(
                `SELECT id, title, category FROM events
                 WHERE ${like('title')} OR ${like('description')} OR ${like('location')}
                 ORDER BY startDate DESC LIMIT ${PER_TYPE}`,
                [term, term, term]
            ),
            query<RowDataPacket[]>(
                `SELECT l.id, l.name, c.label FROM labs l JOIN lab_categories c ON c.id = l.categoryId
                 WHERE l.isBookable = 1 AND (${like('l.name')} OR ${like('l.shortDesc')} OR ${like('l.tag')})
                 LIMIT ${PER_TYPE}`,
                [term, term, term]
            ),
            query<RowDataPacket[]>(
                `SELECT id, title, type FROM club_news
                 WHERE ${like('title')} OR ${like('summary')} OR ${like('location')}
                 ORDER BY eventDate DESC LIMIT ${PER_TYPE}`,
                [term, term, term]
            ),
            query<RowDataPacket[]>(
                `SELECT p.id, p.title, c.name as categoryName FROM forum_posts p
                 JOIN forum_categories c ON c.id = p.categoryId
                 WHERE p.parentId IS NULL AND (${like('p.title')} OR ${like('p.content')})
                 ORDER BY p.createdAt DESC LIMIT ${PER_TYPE}`,
                [term, term]
            ),
        ])

        return [
            ...projects.map(p => ({ type: 'project' as const, id: p.id, title: p.title, href: `/projects/${p.id}`, category: p.category })),
            ...events.map(e => ({ type: 'event' as const, id: e.id, title: e.title, href: `/events/${e.id}`, category: e.category })),
            ...labs.map(l => ({ type: 'lab' as const, id: l.id, title: l.name, href: `/lab-booking?labId=${encodeURIComponent(l.id)}`, category: l.label })),
            ...news.map(n => {
                const achievement = n.type === 'ACHIEVEMENT'
                return {
                    type: 'news' as const, id: n.id, title: n.title,
                    href: `/news/${achievement ? 'achievement' : 'news'}#news-${n.id}`,
                    category: achievement ? 'Achievement' : 'News',
                }
            }),
            ...research.map(r => ({ type: 'research' as const, id: r.id, title: r.title, href: `/research/${r.id}`, category: r.category })),
            ...topics.map(t => ({ type: 'forum' as const, id: t.id, title: t.title || 'Untitled topic', href: `/forums/topic/${t.id}`, category: t.categoryName })),
        ]
    } catch (error) {
        console.error('Search error:', error)
        return []
    }
}
