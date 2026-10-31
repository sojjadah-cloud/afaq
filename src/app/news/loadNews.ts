import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import type { NewsItem } from './NewsClient'
import type { Lang } from '@/i18n/core'
import { localize } from '@/lib/localized'

export async function loadNews(lang: Lang, type?: 'NEWS' | 'ACHIEVEMENT') {
    const rows = localize(await query<RowDataPacket[]>(
        'SELECT id, title, titleAr, summary, summaryAr, imageUrl, type, eventDate, location, locationAr FROM club_news ORDER BY eventDate DESC, createdAt DESC'
    ), lang)
    const all = rows.map(r => ({
        id: r.id,
        title: r.title,
        summary: r.summary,
        imageUrl: r.imageUrl,
        type: r.type === 'ACHIEVEMENT' ? 'ACHIEVEMENT' : 'NEWS',
        eventDate: r.eventDate ? String(r.eventDate) : null,
        location: r.location,
    })) as NewsItem[]

    return {
        items: type ? all.filter(i => i.type === type) : all,
        counts: {
            ALL: all.length,
            NEWS: all.filter(i => i.type === 'NEWS').length,
            ACHIEVEMENT: all.filter(i => i.type === 'ACHIEVEMENT').length,
        },
    }
}
