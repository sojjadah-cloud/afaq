import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { RowDataPacket } from '@/lib/types'
import NewsClient from './NewsClient'

export const dynamic = 'force-dynamic'

interface NewsItem extends RowDataPacket {
    id: string
    title: string
    summary: string
    type: 'NEWS' | 'ACHIEVEMENT'
    eventDate: string | null
    createdAt: string
}

export default async function NewsPage() {
    const session = await getSession()

    let news: NewsItem[] = []
    try {
        news = await query<NewsItem[]>(`
            SELECT * FROM club_news
            ORDER BY eventDate DESC, createdAt DESC
        `)
    } catch (error) {
        console.error('Failed to fetch news:', error)
    }

    return (
        <NewsClient
            initialNews={news}
            userRole={session.role}
            isLoggedIn={session.isLoggedIn || false}
        />
    )
}
