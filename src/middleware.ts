import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from './lib/auth'

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

    const session = await getSession()

    if (!session.isLoggedIn) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Admin route protection
    // Admin route protection
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (session.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
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
