import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { getForumTopics } from '@/actions/forum'
import { RowDataPacket } from 'mysql2'
import { notFound } from 'next/navigation'
import CategoryClient from './CategoryClient'

export const dynamic = 'force-dynamic'

interface Category extends RowDataPacket {
    id: string
    name: string
    description: string
    icon: string
    color: string
}

export default async function CategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
    const { categoryId } = await params
    const session = await getSession()

    // Get category details
    const categories = await query<Category[]>(
        'SELECT * FROM forum_categories WHERE id = ?',
        [categoryId]
    )

    if (!categories[0]) {
        notFound()
    }

    const topics = await getForumTopics(categoryId)

    return (
        <CategoryClient
            category={categories[0]}
            topics={topics as any[]}
            isLoggedIn={session.isLoggedIn || false}
        />
    )
}
