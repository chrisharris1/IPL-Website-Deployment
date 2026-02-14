
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDb } from '@/lib/mongodb'
import { comparePassword } from '@/lib/auth-node'
import { signToken } from '@/lib/auth-edge'
import { checkRateLimit } from '@/lib/rate-limit'
import { loginSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
    // 1. Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { success } = await checkRateLimit(ip) // 5 attempts per minute

    if (!success) {
        return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 })
    }

    try {
        // 2. Input Validation
        const body = await request.json()
        const validation = loginSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }

        const { username, password } = validation.data
        const db = await getDb()

        // 3. User Lookup
        const user = await db.collection('users').findOne({ username })

        if (!user) {
            // Check if it's the very first login and no users exist
            // If so, hint to use setup endpoint (or auto-redirect in frontend)
            const count = await db.collection('users').countDocuments()
            if (count === 0) {
                return NextResponse.json({ error: 'No users found. Please initialize the system via /api/admin/setup' }, { status: 404 })
            }
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // 4. Verify Password
        const isMatch = await comparePassword(password, user.password)
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // 5. Generate Token
        // Payload: sub (id), username, role
        const token = await signToken({
            sub: user._id.toString(),
            username: user.username,
            role: user.role || 'admin'
        })

        // 6. Set Cookie
        const cookieStore = await cookies()
        cookieStore.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 4 * 60 * 60, // 4 hours
            path: '/',
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
