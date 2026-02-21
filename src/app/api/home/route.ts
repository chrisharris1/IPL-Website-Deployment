import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const db = await getDb()

        // Get active carousel images
        const carousel = await db
            .collection('home_carousel')
            .find({ active: true })
            .sort({ order_index: 1 })
            .project({ image_url: 1, title: 1, subtitle: 1, hide_text: 1, _id: 0 })
            .toArray()

        // Get latest 10 humanitarian services
        const services = await db
            .collection('humanitarian_services')
            .find({})
            .sort({ date: -1 })
            .limit(10)
            .toArray()

        const mappedServices = services.map((s) => ({
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
            data: { carousel, services: mappedServices },
        })
    } catch (error) {
        console.error('Home API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Database error' },
            { status: 500 }
        )
    }
}
