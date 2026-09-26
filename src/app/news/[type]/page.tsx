import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { RowDataPacket } from 'mysql2'
import { notFound } from 'next/navigation'
import TypeNewsClient from './TypeNewsClient'

interface NewsItem extends RowDataPacket {
    id: string
    title: string
    summary: string
    imageUrl: string | null
    type: 'NEWS' | 'ACHIEVEMENT'
    eventDate: string | null
    createdAt: string
}

const TYPE_MAP: Record<string, 'NEWS' | 'ACHIEVEMENT'> = {
    news: 'NEWS',
    achievement: 'ACHIEVEMENT',
}

export default async function NewsTypePage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = await params
    const dbType = TYPE_MAP[type]

    if (!dbType) {
        notFound()
    }

    const session = await getSession()

    const items = await query<NewsItem[]>(
        'SELECT * FROM club_news WHERE type = ? ORDER BY eventDate DESC, createdAt DESC',
        [dbType]
    )

    return (
        <TypeNewsClient
            type={dbType}
            items={items}
            userRole={session.role}
            isLoggedIn={session.isLoggedIn || false}
        />
    )
}
