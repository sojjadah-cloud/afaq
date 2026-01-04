import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { RowDataPacket } from 'mysql2'
import ResearchClient from './ResearchClient'

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

export default async function ResearchPage() {
    const session = await getSession()

    let research: Research[] = []
    try {
        research = await query<Research[]>(`
            SELECT * FROM research 
            ORDER BY publicationDate DESC, createdAt DESC
        `)
    } catch (error) {
        console.error('Failed to fetch research:', error)
    }

    return (
        <ResearchClient
            initialResearch={research}
            userRole={session.role}
            isLoggedIn={session.isLoggedIn || false}
        />
    )
}

