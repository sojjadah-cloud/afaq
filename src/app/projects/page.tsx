import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import ProjectsClient from './ProjectsClient'
import { getProjectSections } from '@/lib/sections'

export const metadata = { title: 'Projects' }

export const dynamic = 'force-dynamic'

interface CountResult extends RowDataPacket {
    count: number
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ new?: string; section?: string }> }) {
    const { new: openCreate, section } = await searchParams
    const sections = (await getProjectSections()).map(s => ({ slug: s.slug, name: s.name }))
    const initialSection = sections.some(s => s.slug === section) ? section : ''
    const startResult = await query<CountResult[]>("SELECT COUNT(*) as count FROM projects WHERE status IN ('START', 'PENDING_APPROVAL')")
    const devResult = await query<CountResult[]>("SELECT COUNT(*) as count FROM projects WHERE status IN ('DEVELOPMENT', 'PENDING_COMPLETION')")
    const completedResult = await query<CountResult[]>("SELECT COUNT(*) as count FROM projects WHERE status = 'COMPLETED'")

    const projectCounts = {
        start: startResult[0].count,
        development: devResult[0].count,
        completed: completedResult[0].count,
    }

    return (
        <ProjectsClient
            initialCounts={projectCounts}
            sections={sections}
            openCreate={openCreate === '1'}
            initialSection={initialSection}
        />
    )
}
