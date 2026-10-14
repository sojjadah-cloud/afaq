import type { Metadata } from 'next'
import { query } from './db'
import { RowDataPacket } from './types'
import { getProjectSection } from './sections'

// Browser-tab title for a record page, e.g. a project or event name. The site
// name is appended by the title template in the root layout.
export async function recordTitle(sql: string, id: string, fallback: string): Promise<Metadata> {
    try {
        const rows = await query<RowDataPacket[]>(sql, [id])
        const title = rows[0]?.title ? String(rows[0].title) : fallback
        return { title: title.length > 70 ? `${title.slice(0, 67)}...` : title }
    } catch {
        return { title: fallback }
    }
}

export async function sectionTitle(stageTitle: string, slug: string): Promise<Metadata> {
    const section = await getProjectSection(slug).catch(() => undefined)
    return { title: section ? `${stageTitle}: ${section.name}` : stageTitle }
}
