import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
    try {
        const db = await getDb()

        const sections = await db
            .collection('about_us')
            .find({})
            .sort({ order_index: 1 })
            .toArray()

        const mapped = sections.map((s) => ({
            id: s._id.toString(),
            section_title_en: s.section_title_en,
            section_title_ta: s.section_title_ta,
            content_en: s.content_en,
            content_ta: s.content_ta,
            order_index: s.order_index,
        }))

        return NextResponse.json(
            { success: true, data: mapped },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                },
            }
        )
    } catch (error) {
        console.error('About API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Database error' },
            { status: 500 }
        )
    }
}
