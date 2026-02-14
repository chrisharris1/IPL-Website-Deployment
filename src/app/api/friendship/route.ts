import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
    try {
        const db = await getDb()

        const locations = await db
            .collection('friendship_meet_locations')
            .find({})
            .sort({ year: -1, country: 1, state: 1, district: 1 })
            .toArray()

        const flat = await Promise.all(
            locations.map(async (loc) => {
                const events = await db
                    .collection('friendship_meet_events')
                    .find({ location_id: loc._id.toString() })
                    .sort({ created_at: -1 })
                    .toArray()

                return {
                    location: {
                        id: loc._id.toString(),
                        country: loc.country,
                        state: loc.state,
                        district: loc.district,
                        year: loc.year,
                    },
                    events: events.map((e) => ({
                        id: e._id.toString(),
                        details_en: e.details_en,
                        details_ta: e.details_ta,
                        image_url: e.image_url,
                        created_at: e.created_at,
                    })),
                }
            })
        )

        // Build hierarchical structure
        const hierarchical: Record<string, Record<string, Record<string, Record<string, unknown[]>>>> = {}
        for (const item of flat) {
            const { country, state, district, year } = item.location
            if (!hierarchical[country]) hierarchical[country] = {}
            if (!hierarchical[country][state]) hierarchical[country][state] = {}
            if (!hierarchical[country][state][district])
                hierarchical[country][state][district] = {}
            hierarchical[country][state][district][String(year)] = item.events
        }

        return NextResponse.json({
            success: true,
            data: { flat, hierarchical },
            meta: { total_locations: flat.length },
        })
    } catch (error) {
        console.error('Friendship API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Database error' },
            { status: 500 }
        )
    }
}
