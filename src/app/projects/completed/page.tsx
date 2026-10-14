import StageSections from '../StageSections'

export const metadata = { title: 'Completed Projects' }

export const dynamic = 'force-dynamic'

export default function Page() {
    return <StageSections stage="completed" />
}
