import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Script from 'next/script'

export const metadata: Metadata = {
    title: 'AFAQ Innovation Portal',
    description: 'Military Technological College Innovation Platform',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
                />
            </head>
            <body>
                <Header />
                <Nav />
                {children}
                <Footer />
            </body>
        </html>
    )
}
