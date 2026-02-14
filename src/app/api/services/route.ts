import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const db = await getDb()
        const { searchParams } = request.nextUrl

        // Build filter
        const filter: Record<string, string> = {}
        if (searchParams.get('country')) filter.country = searchParams.get('country')!
        if (searchParams.get('state')) filter.state = searchParams.get('state')!
        if (searchParams.get('district')) filter.district = searchParams.get('district')!

        const limit = parseInt(searchParams.get('limit') || '100')
        const offset = parseInt(searchParams.get('offset') || '0')

        const [services, total] = await Promise.all([
            db
                .collection('humanitarian_services')
                .find(filter)
                .sort({ date: -1 })
                .skip(offset)
                .limit(limit)
                .toArray(),
            db.collection('humanitarian_services').countDocuments(filter),
        ])

        const mapped = services.map((s) => ({
            id: s._id.toString(),
            title_en: s.title_en,
            title_ta: s.title_ta,
            country: s.country,
            state: s.state,
            district: s.district,
            city: s.city,
            date: s.date,
            description_en: s.description_en,
            description_ta: s.description_ta,
            image_url: s.image_url,
        }))

        return NextResponse.json({
            success: true,
            data: mapped,
            meta: { total, limit, offset },
        })
    } catch (error) {
        console.error('Services API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Database error' },
            { status: 500 }
        )
    }
}
