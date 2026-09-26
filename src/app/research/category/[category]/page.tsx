import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { RowDataPacket } from 'mysql2'
import { notFound } from 'next/navigation'
import CategoryResearchClient from './CategoryResearchClient'

interface Research extends RowDataPacket {
    id: string
    title: string
    abstract: string
    authors: string
    category: string
    publicationDate: string | null
    url: string | null
    createdAt: string
}

const VALID_CATEGORIES = ['Published', 'Ongoing', 'Thesis', 'Conference', 'Patent']

export default async function ResearchCategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params

    if (!VALID_CATEGORIES.includes(category)) {
        notFound()
    }

    const session = await getSession()

    const research = await query<Research[]>(
        'SELECT * FROM research WHERE category = ? ORDER BY publicationDate DESC, createdAt DESC',
        [category]
    )

    return (
        <CategoryResearchClient
            category={category}
            items={research}
            userRole={session.role}
            isLoggedIn={session.isLoggedIn || false}
        />
    )
}
