import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAdminSession } from '@/lib/auth-edge'
import { friendsDaySchema } from '@/lib/validation'

// GET - Retrieve Friends Day content
export async function GET(request: NextRequest) {
    try {
        const db = await getDb()
        const content = await db.collection('friends_day_content').findOne({ id: 'main' })

        if (!content) {
            // Return default/empty structure if not found
            return NextResponse.json({
                success: true,
                data: {
                    intro_title_en: '',
                    intro_title_ta: '',
                    intro_content_en: '',
                    intro_content_ta: '',
                    about_title_en: '',
                    about_title_ta: '',
                    about_content_en: '',
                    about_content_ta: ''
                }
            })
        }

        return NextResponse.json({ success: true, data: content })
    } catch (error) {
        console.error('Friends Day GET error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// POST/PUT - Update Friends Day content
export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Validation
        const validation = friendsDaySchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.format() }, { status: 400 })
        }

        const db = await getDb()

        // Upsert (update if exists, insert if not)
        const updateDoc = {
            ...validation.data,
            id: 'main', // Singleton ID
            updatedAt: new Date()
        }

        await db.collection('friends_day_content').updateOne(
            { id: 'main' },
            { $set: updateDoc },
            { upsert: true }
        )

        return NextResponse.json({ success: true, data: updateDoc })
    } catch (error) {
        console.error('Friends Day POST error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
