'use server'

import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'

interface SearchResult {
    type: 'project' | 'research' | 'event' | 'lab'
    id: string
    title: string
    description: string
    status?: string
    category?: string
}

export async function globalSearch(searchQuery: string): Promise<SearchResult[]> {
    if (!searchQuery || searchQuery.trim().length < 2) {
        return []
    }

    const term = `%${searchQuery.trim()}%`
    const results: SearchResult[] = []

    try {
        // Search Projects
        const projects = await query<RowDataPacket[]>(`
            SELECT id, title, description, status, category 
            FROM projects 
            WHERE title LIKE ? OR description LIKE ? OR category LIKE ?
            LIMIT 5
        `, [term, term, term])

        projects.forEach(p => {
            results.push({
                type: 'project',
                id: p.id,
                title: p.title,
                description: p.description?.substring(0, 100) + '...' || '',
                status: p.status,
                category: p.category
            })
        })

        // Search Research
        const research = await query<RowDataPacket[]>(`
            SELECT id, title, abstract, category 
            FROM research 
            WHERE title LIKE ? OR abstract LIKE ? OR authors LIKE ?
            LIMIT 5
        `, [term, term, term])

        research.forEach(r => {
            results.push({
                type: 'research',
                id: r.id,
                title: r.title,
                description: r.abstract?.substring(0, 100) + '...' || '',
                category: r.category
            })
        })

        // Search Events
        const events = await query<RowDataPacket[]>(`
            SELECT id, title, description, category 
            FROM events 
            WHERE title LIKE ? OR description LIKE ?
            LIMIT 5
        `, [term, term])

        events.forEach(e => {
            results.push({
                type: 'event',
                id: e.id,
                title: e.title,
                description: e.description?.substring(0, 100) + '...' || '',
                category: e.category
            })
        })

        // Search Labs
        const labs = await query<RowDataPacket[]>(`
            SELECT id, name, shortDesc, tag 
            FROM labs 
            WHERE name LIKE ? OR shortDesc LIKE ? OR tag LIKE ?
            LIMIT 5
        `, [term, term, term])

        labs.forEach(l => {
            results.push({
                type: 'lab',
                id: l.id,
                title: l.name,
                description: l.shortDesc || '',
                category: l.tag
            })
        })

        return results
    } catch (error) {
        console.error('Search error:', error)
        return []
    }
}
