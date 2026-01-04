import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Login - AFAQ Innovation Portal',
}

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // This layout excludes the Header, Nav, and Footer for clean login page
    return <>{children}</>
}
