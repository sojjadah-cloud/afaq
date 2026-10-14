import StageSections from '../StageSections'
import { pageTitle } from '@/lib/metadata'

export const generateMetadata = () => pageTitle('Completed Projects')

export const dynamic = 'force-dynamic'

export default function Page() {
    return <StageSections stage="completed" />
}
