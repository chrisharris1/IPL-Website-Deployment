import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

// GET - Retrieve Friendship Meets content (public endpoint)
export async function GET(request: NextRequest) {
    try {
        const db = await getDb()
        const content = await db.collection('friendship_meets_content').findOne({ id: 'main' })

        if (!content) {
            // Return default/empty structure if not found
            return NextResponse.json({
                success: true,
                data: {
                    intro_title_en: '',
                    intro_title_ta: '',
                    intro_content_en: '',
                    intro_content_ta: ''
                }
            })
        }

        return NextResponse.json({ success: true, data: content })
    } catch (error) {
        console.error('Friendship Meets Content GET error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
