
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth-edge'

export default async function proxy(request: NextRequest) {
    // Only secure /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Allow login page
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next()
        }

        const token = request.cookies.get('admin_token')?.value

        // Verify token
        // Note: verifyToken uses 'jose' which is Edge compatible
        const payload = token ? await verifyToken(token) : null

        if (!payload) {
            const loginUrl = new URL('/admin/login', request.url)
            // loginUrl.searchParams.set('from', request.nextUrl.pathname)
            return NextResponse.redirect(loginUrl)
        }
    }
    return NextResponse.next()
}

export const config = {
    matcher: '/admin/:path*',
}
