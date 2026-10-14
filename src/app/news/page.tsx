import { getSession } from '@/lib/auth'
import NewsClient from './NewsClient'
import { loadNews } from './loadNews'
import { pageTitle } from '@/lib/metadata'

export const generateMetadata = () => pageTitle('News & Achievements')

export const dynamic = 'force-dynamic'

export default async function NewsPage() {
    const session = await getSession()
    const { items, counts } = await loadNews()

    return (
        <NewsClient
            items={items}
            counts={counts}
            active="ALL"
            userRole={session.role}
            isLoggedIn={session.isLoggedIn || false}
        />
    )
}
