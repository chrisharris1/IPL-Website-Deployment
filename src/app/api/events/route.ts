import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const db = await getDb()
        const { searchParams } = request.nextUrl
        const search = searchParams.get('search')

        const filter: Record<string, unknown> = {}
        if (search) {
            filter.$or = [
                { title_en: { $regex: search, $options: 'i' } },
                { title_ta: { $regex: search, $options: 'i' } },
                { description_en: { $regex: search, $options: 'i' } },
                { description_ta: { $regex: search, $options: 'i' } },
            ]
        }

        const events = await db
            .collection('events')
            .find(filter)
            .sort({ date: -1, createdAt: -1 })
            .toArray()

        const mapped = events.map((e) => ({
            id: e._id.toString(),
            newsId: e.newsId,
            title_en: e.title_en || '',
            title_ta: e.title_ta || '',
            description_en: e.description_en || '',
            description_ta: e.description_ta || '',
            posterImage: e.posterImage || '',
            photos: e.photos || [],
            date: e.date,
            createdAt: e.createdAt,
        }))

        return NextResponse.json({ success: true, data: mapped })
    } catch (error) {
        console.error('GET events error:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch events' }, { status: 500 })
    }
}
