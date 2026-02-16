import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

// GET all items (admin view)
export async function GET() {
    try {
        const db = await getDb()
        const content = await db.collection('join_now')
            .find({})
            .sort({ order_index: 1, created_at: -1 })
            .toArray()

        const mapped = content.map(item => ({
            id: item._id.toString(),
            title_en: item.title_en,
            title_ta: item.title_ta,
            content_en: item.content_en,
            content_ta: item.content_ta,
            google_form_url: item.google_form_url,
            order_index: item.order_index
        }))

        return NextResponse.json({ success: true, data: mapped })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }
}

// POST new item
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const db = await getDb()

        const newItem = {
            title_en: body.title_en || '',
            title_ta: body.title_ta || '',
            content_en: body.content_en || '',
            content_ta: body.content_ta || '',
            google_form_url: body.google_form_url || '',
            order_index: parseInt(body.order_index || '0'),
            created_at: new Date()
        }

        const result = await db.collection('join_now').insertOne(newItem)

        return NextResponse.json({ success: true, id: result.insertedId })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 })
    }
}

// PUT update item
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, ...updateData } = body

        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

        const db = await getDb()

        const updateDoc = {
            $set: {
                title_en: updateData.title_en,
                title_ta: updateData.title_ta,
                content_en: updateData.content_en,
                content_ta: updateData.content_ta,
                google_form_url: updateData.google_form_url,
                order_index: parseInt(updateData.order_index || '0'),
                updated_at: new Date()
            }
        }

        await db.collection('join_now').updateOne(
            { _id: new ObjectId(id) },
            updateDoc
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 })
    }
}

// DELETE item
export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json()
        const { id } = body

        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

        const db = await getDb()
        await db.collection('join_now').deleteOne({ _id: new ObjectId(id) })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 })
    }
}
