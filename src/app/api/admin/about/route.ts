import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAdminSession } from '@/lib/auth-edge'
import { aboutSchema } from '@/lib/validation'
import DOMPurify from 'isomorphic-dompurify'

// GET - List all about sections
export async function GET(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }
        const db = await getDb()
        const sections = await db
            .collection('about_us')
            .find({})
            .sort({ order_index: 1 })
            .toArray()

        const mapped = sections.map((s) => ({
            id: s._id.toString(),
            section_title_en: s.section_title_en,
            section_title_ta: s.section_title_ta,
            content_en: s.content_en,
            content_ta: s.content_ta,
            order_index: s.order_index,
            is_deletable: s.is_deletable !== false, // default true
        }))

        return NextResponse.json({ success: true, data: mapped })
    } catch (error) {
        console.error('Admin About GET error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// POST - Add new section
export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validation = aboutSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.format() }, { status: 400 })
        }

        const { section_title_en, section_title_ta, content_en, content_ta } = validation.data

        const db = await getDb()

        // Get next order index
        const last = await db.collection('about_us').find({}).sort({ order_index: -1 }).limit(1).toArray()
        const nextOrder = last.length > 0 ? (last[0].order_index || 0) + 1 : 0

        const doc = {
            section_title_en: section_title_en || '',
            section_title_ta: section_title_ta || '',
            content_en: DOMPurify.sanitize(content_en || ''),
            content_ta: content_ta ? DOMPurify.sanitize(content_ta) : '',
            order_index: nextOrder,
            is_deletable: true,
            created_at: new Date(),
        }

        const result = await db.collection('about_us').insertOne(doc)

        return NextResponse.json({
            success: true,
            data: { id: result.insertedId.toString(), ...doc },
        })
    } catch (error) {
        console.error('Admin About POST error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// PUT - Update section
export async function PUT(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        // Allow partial updates, but validate known fields
        const { id, section_title_en, section_title_ta, content_en, content_ta, order_index } = body

        if (!id) {
            return NextResponse.json({ success: false, error: 'No ID provided' }, { status: 400 })
        }

        const db = await getDb()
        const update: Record<string, unknown> = {}

        if (section_title_en !== undefined) update.section_title_en = section_title_en
        if (section_title_ta !== undefined) update.section_title_ta = section_title_ta
        if (content_en !== undefined) update.content_en = DOMPurify.sanitize(String(content_en))
        if (content_ta !== undefined) update.content_ta = DOMPurify.sanitize(String(content_ta))
        if (order_index !== undefined) update.order_index = order_index

        await db.collection('about_us').updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin About PUT error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// DELETE - Remove section
export async function DELETE(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await request.json()
        if (!id) {
            return NextResponse.json({ success: false, error: 'No ID provided' }, { status: 400 })
        }

        const db = await getDb()
        const doc = await db.collection('about_us').findOne({ _id: new ObjectId(id) })

        if (doc && doc.is_deletable === false) {
            return NextResponse.json({ success: false, error: 'This section cannot be deleted' }, { status: 400 })
        }

        if (doc) {
            await db.collection('about_us').deleteOne({ _id: new ObjectId(id) })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin About DELETE error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
