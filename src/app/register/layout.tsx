import { pageTitle } from '@/lib/metadata'

export const generateMetadata = () => pageTitle('Register')

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
