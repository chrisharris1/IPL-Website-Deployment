import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'

import { getDb } from '@/lib/mongodb'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, error: 'Valid card ID is required' }, { status: 400 })
        }

        const db = await getDb()
        const card = await db.collection('friends_day_events').findOne({ _id: new ObjectId(id) })
        if (!card) {
            return NextResponse.json({ success: false, error: 'Friends Day card not found' }, { status: 404 })
        }

        const items = await db
            .collection('friends_day_gallery_items')
            .find({ card_id: card._id.toString() })
            .sort({ created_at: -1 })
            .toArray()

        return NextResponse.json({
            success: true,
            data: items.map((item) => ({
                id: item._id.toString(),
                card_id: item.card_id,
                title_en: item.title_en || '',
                title_ta: item.title_ta || '',
                description_en: item.description_en || '',
                description_ta: item.description_ta || '',
                image: item.image || null,
                created_at: item.created_at,
            })),
        })
    } catch (error) {
        console.error('Friends Day gallery GET error:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch gallery items' }, { status: 500 })
    }
}
