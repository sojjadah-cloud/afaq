import { getSession } from '@/lib/auth'
import { getForumTopic } from '@/actions/forum'
import { notFound } from 'next/navigation'
import TopicClient from './TopicClient'

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
