import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import SiteChrome from '@/components/SiteChrome'
import { ToastProvider } from '@/components/Toast'
import { I18nProvider } from '@/i18n/client'
import { getT } from '@/i18n/server'
import { dirOf } from '@/i18n/core'

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getT()
    const site = t('AFAQ Innovation Portal')
    return {
        title: { default: site, template: `%s | ${site}` },
        description: t('Innovation portal of the AFAQ Scientific Club at the Military Technological College, Oman: projects, events, workshops, labs and tools.'),
    }
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { lang } = await getT()

    return (
        <html lang={lang} dir={dirOf(lang)}>
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
                />
            </head>
            <body>
                <I18nProvider lang={lang}>
                    <ToastProvider>
                        <SiteChrome header={<Header />} nav={<Nav />} footer={<Footer />}>
                            {children}
                        </SiteChrome>
                    </ToastProvider>
                </I18nProvider>
            </body>
        </html>
    )
}
