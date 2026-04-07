import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
    try {
        const db = await getDb()
        const { searchParams } = request.nextUrl

        const filter: Record<string, string> = {}
        const search = searchParams.get('search') || ''
        const mongoFilter: any = filter
        if (search) {
            mongoFilter.$or = [
                { title_en: { $regex: search, $options: 'i' } },
                { title_ta: { $regex: search, $options: 'i' } },
            ]
        }

        const limit = parseInt(searchParams.get('limit') || '100')
        const offset = parseInt(searchParams.get('offset') || '0')

        const [posts, total] = await Promise.all([
            db
                .collection('president_blog')
                .find(mongoFilter)
                .sort({ order_index: 1, created_at: -1 })
                .skip(offset)
                .limit(limit)
                .toArray(),
            db.collection('president_blog').countDocuments(mongoFilter),
        ])

        const mapped = posts.map((p) => ({
            id: p._id.toString(),
            title_en: p.title_en || '',
            title_ta: p.title_ta || '',
            description_en: p.description_en || '',
            description_ta: p.description_ta || '',
            image_url: p.image_url || '',
        }))

        return NextResponse.json({
            success: true,
            data: mapped,
            meta: { total, limit, offset },
        })
    } catch (error) {
        console.error('President Blog API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Database error' },
            { status: 500 }
        )
    }
}
