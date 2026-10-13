import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import type { NewsItem } from './NewsClient'

export async function loadNews(type?: 'NEWS' | 'ACHIEVEMENT') {
    const rows = await query<RowDataPacket[]>(
        'SELECT id, title, summary, imageUrl, type, eventDate, location FROM club_news ORDER BY eventDate DESC, createdAt DESC'
    )
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
