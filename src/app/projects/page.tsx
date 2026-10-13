import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import ProjectsClient from './ProjectsClient'

export const dynamic = 'force-dynamic'

interface CountResult extends RowDataPacket {
    count: number
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
    const { new: openCreate } = await searchParams
    const startResult = await query<CountResult[]>("SELECT COUNT(*) as count FROM projects WHERE status IN ('START', 'PENDING_APPROVAL')")
    const devResult = await query<CountResult[]>("SELECT COUNT(*) as count FROM projects WHERE status IN ('DEVELOPMENT', 'PENDING_COMPLETION')")
    const completedResult = await query<CountResult[]>("SELECT COUNT(*) as count FROM projects WHERE status = 'COMPLETED'")

    const projectCounts = {
        start: startResult[0].count,
        development: devResult[0].count,
        completed: completedResult[0].count,
    }

    return <ProjectsClient initialCounts={projectCounts} openCreate={openCreate === '1'} />
}
