import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Register - AFAQ Innovation Portal',
}

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
