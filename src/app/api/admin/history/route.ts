import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAdminSession } from '@/lib/auth-edge'
import { historySchema } from '@/lib/validation'
import sanitizeHtml from 'sanitize-html'

const sanitizeRichText = (html: string) =>
    sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['span', 'p', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li']),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            span: ['style'],
            p: ['style'],
            div: ['style'],
            h1: ['style'],
            h2: ['style'],
            h3: ['style'],
            h4: ['style'],
            h5: ['style'],
            h6: ['style'],
        },
        allowedStyles: {
            '*': {
                'color': [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^rgba\(/, /^[a-zA-Z]+$/],
                'font-size': [/^\d+(?:\.\d+)?(?:px|em|rem|%)$/],
                'font-family': [/^[\w\s,'"-]+$/],
                'text-decoration': [/^underline$/, /^line-through$/, /^none$/],
                'font-weight': [/^\d{3}$/, /^bold$/, /^normal$/],
                'font-style': [/^italic$/, /^normal$/],
            },
        },
    })

export async function GET() {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const db = await getDb()
        const sections = await db
            .collection('history_sections')
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
            is_deletable: s.is_deletable !== false,
        }))

        return NextResponse.json({ success: true, data: mapped })
    } catch (error) {
        console.error('Admin History GET error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validation = historySchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.format() }, { status: 400 })
        }

        const { section_title_en, section_title_ta, content_en, content_ta } = validation.data

        const db = await getDb()
        const last = await db.collection('history_sections').find({}).sort({ order_index: -1 }).limit(1).toArray()
        const nextOrder = last.length > 0 ? (last[0].order_index || 0) + 1 : 0

        const doc = {
            section_title_en: section_title_en || '',
            section_title_ta: section_title_ta || '',
            content_en: sanitizeRichText(content_en),
            content_ta: content_ta ? sanitizeRichText(content_ta) : '',
            order_index: nextOrder,
            is_deletable: true,
            created_at: new Date(),
        }

        const result = await db.collection('history_sections').insertOne(doc)

        return NextResponse.json({
            success: true,
            data: { id: result.insertedId.toString(), ...doc },
        })
    } catch (error) {
        console.error('Admin History POST error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        if (!body.id) {
            return NextResponse.json({ success: false, error: 'No ID provided' }, { status: 400 })
        }

        const validation = historySchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.format() }, { status: 400 })
        }

        const { section_title_en, section_title_ta, content_en, content_ta, order_index, id } = body

        const db = await getDb()
        const update: Record<string, unknown> = {}

        if (section_title_en !== undefined) update.section_title_en = section_title_en
        if (section_title_ta !== undefined) update.section_title_ta = section_title_ta
        if (content_en !== undefined) update.content_en = sanitizeRichText(content_en)
        if (content_ta !== undefined) update.content_ta = sanitizeRichText(content_ta)
        if (order_index !== undefined) update.order_index = order_index

        await db.collection('history_sections').updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin History PUT error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

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
        const doc = await db.collection('history_sections').findOne({ _id: new ObjectId(id) })

        if (doc && doc.is_deletable === false) {
            return NextResponse.json({ success: false, error: 'This section cannot be deleted' }, { status: 400 })
        }

        if (doc) {
            await db.collection('history_sections').deleteOne({ _id: new ObjectId(id) })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin History DELETE error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
