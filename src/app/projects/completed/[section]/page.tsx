import SectionProjects from '../../SectionProjects'
import { sectionTitle } from '@/lib/metadata'

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
    const { section } = await params
    return sectionTitle('Completed Projects', section)
}

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
    const { section } = await params
    return <SectionProjects stage="completed" sectionSlug={section} />
}
