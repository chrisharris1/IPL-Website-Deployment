import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const db = await getDb()
        const content = await db.collection('join_now')
            .find({})
            .sort({ order_index: 1, created_at: -1 })
            .toArray()

        const mapped = content.map(item => ({
            id: item._id.toString(),
            title_en: item.title_en,
            title_ta: item.title_ta,
            content_en: item.content_en,
            content_ta: item.content_ta,
            google_form_url: item.google_form_url,
            order_index: item.order_index
        }))

        return NextResponse.json({ success: true, data: mapped })
    } catch (error) {
        console.error('Join Now API Error:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch content' }, { status: 500 })
    }
}
