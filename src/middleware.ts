import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from './lib/auth'
import { STAFF_ADMIN_PATHS } from './lib/roles'

export async function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // paths to exclude from authentication check
    const publicPaths = [
        '/login',
        '/register',
        '/images',
        '/api',
        '/_next',
        '/favicon.ico',
        '/globals.css'
    ]

    const isPublicPath = publicPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    if (isPublicPath) {
        return response
    }

    try {
        const session = await getSession()

        if (!session.isLoggedIn) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        const path = request.nextUrl.pathname
        if (path.startsWith('/admin') && session.role !== 'ADMIN') {
            const staffAllowed = session.role === 'STAFF' && STAFF_ADMIN_PATHS.some(p => path === p || path.startsWith(p + '/'))
            if (!staffAllowed) {
                return NextResponse.redirect(new URL(session.role === 'STAFF' ? '/staff' : '/', request.url))
            }
        }

        return response
    } catch (error) {
        // Never let a broken session (e.g. misconfigured secret) 500 the whole site.
        console.error('Middleware session error:', error)
        return NextResponse.redirect(new URL('/login', request.url))
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
