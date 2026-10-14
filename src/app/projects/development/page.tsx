import StageSections from '../StageSections'

export const metadata = { title: 'Projects in Development' }

export const dynamic = 'force-dynamic'

export default function Page() {
    return <StageSections stage="development" />
}
