import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const db = await getDb()
        const { searchParams } = request.nextUrl
        const search = searchParams.get('search')
        const now = new Date()
        const today = now.toISOString().split('T')[0]
        // Current time in HH:MM format for comparing with the time field
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })

        const filter: Record<string, unknown> = {}
        if (search) {
            filter.$or = [
                { title_en: { $regex: search, $options: 'i' } },
                { title_ta: { $regex: search, $options: 'i' } },
                { description_en: { $regex: search, $options: 'i' } },
                { description_ta: { $regex: search, $options: 'i' } },
            ]
        }

        const mapEvent = (e: Record<string, unknown>) => ({
            id: String(e._id),
            title_en: e.title_en,
            title_ta: e.title_ta,
            country: e.country,
            state: e.state,
            district: e.district,
            city: e.city,
            date: e.date,
            time: e.time,
            description_en: e.description_en,
            description_ta: e.description_ta,
            image_url: e.image_url,
        })

        // Fetch future events, past events, and today's events separately
        const [futureEvents, pastEvents, todayEvents] = await Promise.all([
            db
                .collection('news_events')
                .find({ ...filter, date: { $gt: today } })
                .sort({ date: 1, time: 1 })
                .toArray(),
            db
                .collection('news_events')
                .find({ ...filter, date: { $lt: today } })
                .sort({ date: -1, time: -1 })
                .toArray(),
            db
                .collection('news_events')
                .find({ ...filter, date: today })
                .sort({ time: 1 })
                .toArray(),
        ])

        // Split today's events by time: if event time > current time → upcoming, else → past
        const todayUpcoming = todayEvents.filter((e) => {
            if (!e.time) return true // events without time on today default to upcoming
            return String(e.time) > currentTime
        })
        const todayPast = todayEvents.filter((e) => {
            if (!e.time) return false
            return String(e.time) <= currentTime
        })

        const upcoming = [...todayUpcoming, ...futureEvents]
        const past = [...todayPast.reverse(), ...pastEvents] // reverse so newest today events first

        if (past.length > 0) {
            console.log('DEBUG API - Past Event Sample:', JSON.stringify(mapEvent(past[0]), null, 2))
        }

        return NextResponse.json({
            success: true,
            data: {
                upcoming: upcoming.map(mapEvent),
                past: past.map(mapEvent),
            },
            meta: {
                today,
                upcoming_count: upcoming.length,
                past_count: past.length,
            },
        })
    } catch (error) {
        console.error('News API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Database error' },
            { status: 500 }
        )
    }
}
