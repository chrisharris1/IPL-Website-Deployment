import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET: Fetch all gallery items for a friendship meet (public endpoint)
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        if (!id) {
            return NextResponse.json({ success: false, error: 'Meet ID is required' }, { status: 400 })
        }

        const db = await getDb()
        const meetCollection = db.collection('friendship_meets')
        
        // Support both slug and ObjectId lookup for the meet
        let meetQuery: any
        try {
            if (ObjectId.isValid(id)) {
                meetQuery = { _id: new ObjectId(id) }
            } else {
                throw new Error('Not an ObjectId')
            }
        } catch {
            meetQuery = { slug: id }
        }
        
        // Verify meet exists and get its identifier
        const meet = await meetCollection.findOne(meetQuery)
        if (!meet) {
            return NextResponse.json({ success: false, error: 'Friendship meet not found' }, { status: 404 })
        }
        
        // Use slug if available, otherwise use _id string
        const meetId = meet.slug || meet._id.toString()
        
        const galleryCollection = db.collection('gallery_items')

        // Query gallery items by meet_id (handles both string slugs and legacy ObjectId references)
        const items = await galleryCollection
            .find({
                $or: [
                    { meet_id: meetId }, // String match (new format)
                    { meet_id: meet._id } // ObjectId match (legacy format)
                ]
            })
            .sort({ date: -1, created_at: -1 })
            .toArray()

        const formattedItems = items.map((item) => ({
            id: item._id.toString(),
            meet_id: typeof item.meet_id === 'string' ? item.meet_id : item.meet_id.toString(),
            title_en: item.title_en || '',
            title_ta: item.title_ta || '',
            country: item.country || '',
            state: item.state || '',
            district: item.district || '',
            city: item.city || '',
            date: item.date || null,
            description_en: item.description_en || '',
            description_ta: item.description_ta || '',
            image: item.image || null,
            created_at: item.created_at,
        }))

        return NextResponse.json({ success: true, data: formattedItems })
    } catch (error) {
        console.error('GET gallery items error:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch gallery items' }, { status: 500 })
    }
}
