import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Helper to generate URL-friendly slug from location and year
function generateSlug(district: string, state: string, country: string, year: number): string {
    const normalize = (str: string) => 
        str.toLowerCase()
           .replace(/[^a-z0-9]+/g, '-')
           .replace(/^-+|-+$/g, '')
    
    const parts = [normalize(district), normalize(state), normalize(country), year.toString()]
    return parts.filter(Boolean).join('-')
}

// Helper to ensure unique slug
async function ensureUniqueSlug(db: any, baseSlug: string, excludeId?: ObjectId): Promise<string> {
    const collection = db.collection('friendship_meets')
    let slug = baseSlug
    let counter = 1
    
    while (true) {
        const query: any = { slug }
        if (excludeId) query._id = { $ne: excludeId }
        
        const existing = await collection.findOne(query)
        if (!existing) return slug
        
        slug = `${baseSlug}-${counter}`
        counter++
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const country = searchParams.get('country')
        const state = searchParams.get('state')
        const district = searchParams.get('district')
        const year = searchParams.get('year')

        const db = await getDb()
        const collection = db.collection('friendship_meets')

        const filter: any = {}
        if (country && country !== 'All') filter.country = country
        if (state && state !== 'All') filter.state = state
        if (district && district !== 'All') filter.district = district
        if (year && year !== 'All') filter.year = parseInt(year)

        const meets = await collection
            .find(filter)
            .sort({ year: -1, created_at: -1 })
            .toArray()

        // Auto-migrate: Add slugs to records that don't have them
        const updates = []
        for (const meet of meets) {
            if (!meet.slug) {
                const baseSlug = generateSlug(meet.district, meet.state, meet.country, meet.year)
                const slug = await ensureUniqueSlug(db, baseSlug, meet._id)
                updates.push(
                    collection.updateOne(
                        { _id: meet._id },
                        { $set: { slug, updated_at: new Date() } }
                    )
                )
                meet.slug = slug // Update in memory for response
            }
        }
        if (updates.length > 0) {
            await Promise.all(updates)
        }

        const formattedMeets = meets.map((meet) => ({
            id: meet.slug || meet._id.toString(),
            country: meet.country,
            state: meet.state,
            district: meet.district,
            year: meet.year,
            caption_en: meet.caption_en || '',
            caption_ta: meet.caption_ta || '',
            banner_image: meet.banner_image || null,
        }))

        return NextResponse.json({ success: true, data: formattedMeets })
    } catch (error) {
        console.error('GET friendship meets error:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch friendship meets' }, { status: 500 })
    }
}
