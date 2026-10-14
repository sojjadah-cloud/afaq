import { pageTitle } from '@/lib/metadata'

export const generateMetadata = () => pageTitle('Log In')

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // This layout excludes the Header, Nav, and Footer for clean login page
    return <>{children}</>
}
