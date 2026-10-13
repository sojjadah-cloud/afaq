import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import NewsClient from '../NewsClient'
import { loadNews } from '../loadNews'

export const dynamic = 'force-dynamic'

const TYPE_MAP: Record<string, 'NEWS' | 'ACHIEVEMENT'> = {
    news: 'NEWS',
    achievement: 'ACHIEVEMENT',
}

export default async function NewsTypePage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = await params
    const dbType = TYPE_MAP[type]
    if (!dbType) notFound()

    const session = await getSession()
    const { items, counts } = await loadNews(dbType)

    return (
        <NewsClient
            items={items}
            counts={counts}
            active={dbType}
            userRole={session.role}
            isLoggedIn={session.isLoggedIn || false}
        />
    )
}
