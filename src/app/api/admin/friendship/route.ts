import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { ObjectId } from 'mongodb'
import { getAdminSession } from '@/lib/auth-edge'
import { friendshipLocationSchema, friendshipEventSchema } from '@/lib/validation'

// GET - List all locations with their events
export async function GET() {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const db = await getDb()
        const locations = await db
            .collection('friendship_meet_locations')
            .find({})
            .sort({ year: -1, country: 1, state: 1, district: 1 })
            .toArray()

        const data = await Promise.all(
            locations.map(async (loc) => {
                const events = await db
                    .collection('friendship_meet_events')
                    .find({ location_id: loc._id.toString() })
                    .sort({ created_at: -1 })
                    .toArray()

                return {
                    id: loc._id.toString(),
                    country: loc.country,
                    state: loc.state,
                    district: loc.district,
                    year: loc.year,
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

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Admin Friendship GET error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// POST - Add location or event
export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const contentType = request.headers.get('content-type') || ''
        const db = await getDb()

        // Add location (JSON)
        if (contentType.includes('application/json')) {
            const body = await request.json()
            const validation = friendshipLocationSchema.safeParse(body)
            if (!validation.success) {
                return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.format() }, { status: 400 })
            }
            const { country, state, district, year } = validation.data

            // Check for duplicates
            const existing = await db.collection('friendship_meet_locations').findOne({
                country, state, district, year: Number(year)
            })
            if (existing) {
                return NextResponse.json({ success: false, error: 'Location already exists for this year' }, { status: 400 })
            }

            const result = await db.collection('friendship_meet_locations').insertOne({
                country, state, district, year: Number(year), created_at: new Date()
            })

            return NextResponse.json({
                success: true,
                data: { id: result.insertedId.toString(), country, state, district, year: Number(year) },
            })
        }

        // Add event (FormData with image)
        const formData = await request.formData()
        const locationId = formData.get('location_id') as string
        const file = formData.get('image') as File | null

        const body = {
            location_id: locationId,
            details_en: formData.get('details_en') as string || '',
            details_ta: formData.get('details_ta') as string || '',
        }

        const validation = friendshipEventSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.format() }, { status: 400 })
        }
        const { details_en, details_ta } = validation.data

        if (!locationId || !file) {
            return NextResponse.json({ success: false, error: 'Location ID and image required' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const uploadResult = await uploadImage(buffer, 'friendship')

        if (!uploadResult.success || !uploadResult.url) {
            return NextResponse.json(
                { success: false, error: uploadResult.error || 'Upload failed' },
                { status: 500 }
            )
        }

        const DOMPurify = (await import('isomorphic-dompurify')).default
        const doc = {
            location_id: locationId,
            details_en: DOMPurify.sanitize(details_en || ''),
            details_ta: DOMPurify.sanitize(details_ta || ''),
            image_url: uploadResult.url,
            created_at: new Date(),
        }

        const result = await db.collection('friendship_meet_events').insertOne(doc)

        return NextResponse.json({
            success: true,
            data: { id: result.insertedId.toString(), ...doc },
        })
    } catch (error) {
        console.error('Admin Friendship POST error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// PUT - Update location or event
export async function PUT(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { id, type, ...fields } = body

        if (!id || !type) {
            return NextResponse.json({ success: false, error: 'ID and type required' }, { status: 400 })
        }

        const db = await getDb()

        if (type === 'location') {
            // Validating location update
            const validation = friendshipLocationSchema.partial().safeParse(fields)
            if (!validation.success) return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 })
            const { country, state, district, year } = validation.data

            await db.collection('friendship_meet_locations').updateOne(
                { _id: new ObjectId(id) },
                { $set: { country, state, district, year } }
            )
        } else if (type === 'event') {
            // Validating event update
            const validation = friendshipEventSchema.partial().safeParse(fields)
            if (!validation.success) return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 })
            const { details_en, details_ta } = validation.data

            const DOMPurify = (await import('isomorphic-dompurify')).default
            const update: Record<string, unknown> = {}
            if (details_en !== undefined) update.details_en = DOMPurify.sanitize(details_en)
            if (details_ta !== undefined) update.details_ta = DOMPurify.sanitize(details_ta)

            await db.collection('friendship_meet_events').updateOne(
                { _id: new ObjectId(id) },
                { $set: update }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin Friendship PUT error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// DELETE - Remove location (cascading) or event
export async function DELETE(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id, type } = await request.json()
        if (!id || !type) {
            return NextResponse.json({ success: false, error: 'ID and type required' }, { status: 400 })
        }

        const db = await getDb()

        if (type === 'event') {
            const doc = await db.collection('friendship_meet_events').findOne({ _id: new ObjectId(id) })
            if (doc) {
                await deleteImage(doc.image_url)
                await db.collection('friendship_meet_events').deleteOne({ _id: new ObjectId(id) })
            }
        } else if (type === 'location') {
            // Delete all events for this location first
            const events = await db.collection('friendship_meet_events')
                .find({ location_id: id })
                .toArray()

            for (const event of events) {
                await deleteImage(event.image_url)
            }

            await db.collection('friendship_meet_events').deleteMany({ location_id: id })
            await db.collection('friendship_meet_locations').deleteOne({ _id: new ObjectId(id) })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin Friendship DELETE error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
