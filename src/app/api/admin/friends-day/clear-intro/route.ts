import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAdminSession } from '@/lib/auth-edge'

// POST - Clear intro fields from Friends Day content (one-time cleanup)
export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const db = await getDb()

        // Remove intro fields from the document
        const result = await db.collection('friends_day_content').updateOne(
            { id: 'main' },
            {
                $unset: {
                    intro_title_en: '',
                    intro_title_ta: '',
                    intro_content_en: '',
                    intro_content_ta: ''
                }
            }
        )

        return NextResponse.json({ 
            success: true, 
            message: 'Intro fields removed from Friends Day content',
            modifiedCount: result.modifiedCount
        })
    } catch (error) {
        console.error('Clear intro fields error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
