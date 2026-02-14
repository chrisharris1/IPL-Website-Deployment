
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { hashPassword } from '@/lib/auth-node'
import { loginSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
    try {
        const db = await getDb()
        const count = await db.collection('users').countDocuments()

        if (count > 0) {
            return NextResponse.json({ error: 'Setup already completed' }, { status: 403 })
        }

        const body = await request.json()
        const validation = loginSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 })
        }

        const { username, password } = validation.data
        const hashedPassword = await hashPassword(password)

        await db.collection('users').insertOne({
            username,
            password: hashedPassword,
            role: 'owner', // First user is owner
            created_at: new Date()
        })

        return NextResponse.json({ success: true, message: 'Admin user created. You can now login.' })

    } catch (error) {
        console.error('Setup error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
