import type { Metadata } from 'next'
import { query } from './db'
import { RowDataPacket } from './types'
import { getProjectSection } from './sections'
import { getT } from '@/i18n/server'
import { localizeRow } from './localized'

// Browser-tab titles. The site name is appended by the title template in the
// root layout; titles are translated for the visitor's language.
export async function pageTitle(text: string): Promise<Metadata> {
    const { t } = await getT()
    return { title: t(text) }
}

// The query selects `title` and, for translated content, `titleAr`. Fixed labels
// (categories) pass translate=true to use the interface dictionary instead.
export async function recordTitle(sql: string, id: string, fallback: string, translate = false): Promise<Metadata> {
    const { t, lang } = await getT()
    try {
        const rows = await query<RowDataPacket[]>(sql, [id])
        const row = rows[0] ? localizeRow(rows[0], lang) : null
        const title = row?.title ? (translate ? t(String(row.title)) : String(row.title)) : t(fallback)
        return { title: title.length > 70 ? `${title.slice(0, 67)}...` : title }
    } catch {
        return { title: t(fallback) }
    }
}

export async function sectionTitle(stageTitle: string, slug: string): Promise<Metadata> {
    const { t } = await getT()
    const section = await getProjectSection(slug).catch(() => undefined)
    return { title: section ? `${t(stageTitle)}: ${t(section.name)}` : t(stageTitle) }
}
