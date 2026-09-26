import { query } from '@/lib/db'
import { RowDataPacket } from 'mysql2'
import ProjectsClient from './ProjectsClient'

export const dynamic = 'force-dynamic'

interface CountResult extends RowDataPacket {
    count: number
}

export default async function ProjectsPage() {
    const startResult = await query<CountResult[]>('SELECT COUNT(*) as count FROM projects WHERE status = ?', ['START'])
    const devResult = await query<CountResult[]>('SELECT COUNT(*) as count FROM projects WHERE status = ?', ['DEVELOPMENT'])
    const completedResult = await query<CountResult[]>('SELECT COUNT(*) as count FROM projects WHERE status = ?', ['COMPLETED'])

    const projectCounts = {
        start: startResult[0].count,
        development: devResult[0].count,
        completed: completedResult[0].count,
    }

    return <ProjectsClient initialCounts={projectCounts} />
}
