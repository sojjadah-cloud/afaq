'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const HIDE_CHROME_ON = ['/login', '/register']

export default function SiteChrome({
    header,
    nav,
    footer,
    children,
}: {
    header: ReactNode
    nav: ReactNode
    footer: ReactNode
    children: ReactNode
}) {
    const pathname = usePathname()
    const hideChrome = HIDE_CHROME_ON.some(p => pathname === p || pathname.startsWith(`${p}/`))

    if (hideChrome) {
        return <>{children}</>
    }

    return (
        <>
            {header}
            {nav}
            {children}
            {footer}
        </>
    )
}
