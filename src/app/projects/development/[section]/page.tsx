import SectionProjects from '../../SectionProjects'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
    const { section } = await params
    return <SectionProjects stage="development" sectionSlug={section} />
}
