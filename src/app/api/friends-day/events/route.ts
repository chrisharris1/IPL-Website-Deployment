import { NextResponse } from 'next/server'

import { getDb } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
    try {
        const db = await getDb()
        const events = await db
            .collection('friends_day_events')
            .find({})
            .sort({ created_at: 1 })
            .toArray()

        return NextResponse.json(
            {
                success: true,
                data: events.map((event) => ({
                    id: event._id.toString(),
                    title_en: event.title_en || '',
                    title_ta: event.title_ta || '',
                    description_en: event.description_en || '',
                    description_ta: event.description_ta || '',
                    image: event.image || null,
                })),
            },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                },
            }
        )
    } catch (error) {
        console.error('Friends Day Events GET error:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch friends day cards' }, { status: 500 })
    }
}
