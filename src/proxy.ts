import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession, SESSION_COOKIE } from './lib/auth'
import { getActiveUser } from './lib/session'
import { STAFF_ADMIN_PATHS } from './lib/roles'

const PUBLIC_PATHS = ['/login', '/register', '/images', '/_next', '/favicon.ico']
const GUEST_ONLY = ['/login', '/register']

function homeFor(role: string) {
    if (role === 'ADMIN') return '/admin'
    if (role === 'STAFF') return '/staff'
    return '/'
}

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname
    const isPublic = PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/'))

    try {
        const session = await getSession()
        const user = await getActiveUser(session)

        if (!user) {
            if (isPublic) return NextResponse.next()
            const login = new URL('/login', request.url)
            if (path !== '/') login.searchParams.set('next', path + request.nextUrl.search)
            const response = NextResponse.redirect(login)
            if (session.isLoggedIn) response.cookies.delete(SESSION_COOKIE)
            return response
        }

        if (GUEST_ONLY.includes(path)) {
            return NextResponse.redirect(new URL(homeFor(user.role), request.url))
        }

        if (path.startsWith('/admin') && user.role !== 'ADMIN') {
            const staffAllowed = user.role === 'STAFF' && STAFF_ADMIN_PATHS.some(p => path === p || path.startsWith(p + '/'))
            if (!staffAllowed) {
                return NextResponse.redirect(new URL(user.role === 'STAFF' ? '/staff' : '/', request.url))
            }
        }

        return NextResponse.next()
    } catch (error) {
        // Never let a broken session 500 the whole site.
        console.error('Proxy session error:', error)
        if (isPublic) return NextResponse.next()
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete(SESSION_COOKIE)
        return response
    }
}

export const config = {
    // Everything except API routes (they check the session themselves) and static assets.
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
