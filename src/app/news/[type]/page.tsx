import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import NewsClient from '../NewsClient'
import { loadNews } from '../loadNews'
import { getT } from '@/i18n/server'

export const dynamic = 'force-dynamic'

const TYPE_MAP: Record<string, 'NEWS' | 'ACHIEVEMENT'> = {
    news: 'NEWS',
    achievement: 'ACHIEVEMENT',
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }) {
    const { type } = await params
    return { title: type === 'achievement' ? 'Achievements' : 'News' }
}

export default async function NewsTypePage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = await params
    const dbType = TYPE_MAP[type]
    if (!dbType) notFound()

    const session = await getSession()
    const { lang } = await getT()
    const { items, counts } = await loadNews(lang, dbType)

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
