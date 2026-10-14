import { getSession } from '@/lib/auth'
import { getForumTopic } from '@/actions/forum'
import { notFound } from 'next/navigation'
import TopicClient from './TopicClient'
import { recordTitle } from '@/lib/metadata'

export async function generateMetadata({ params }: { params: Promise<{ topicId: string }> }) {
    const { topicId } = await params
    return recordTitle('SELECT title FROM forum_posts WHERE id = ?', topicId, 'Forum topic')
}

export const dynamic = 'force-dynamic'

export default async function TopicPage({ params }: { params: Promise<{ topicId: string }> }) {
    const { topicId } = await params
    const session = await getSession()

    const topic = await getForumTopic(topicId)

    if (!topic) {
        notFound()
    }

    return (
        <TopicClient
            topic={topic as any}
            isLoggedIn={session.isLoggedIn || false}
            userId={session.userId}
            userRole={session.role}
        />
    )
}
