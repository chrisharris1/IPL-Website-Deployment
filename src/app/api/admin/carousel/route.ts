import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { ObjectId } from 'mongodb'
import { getAdminSession } from '@/lib/auth-edge'
import { carouselSchema } from '@/lib/validation'

// GET - List all carousel images
export async function GET() {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }
        const db = await getDb()
        const images = await db
            .collection('home_carousel')
            .find({})
            .sort({ created_at: -1 })
            .toArray()

        const mapped = images.map((img) => ({
            id: img._id.toString(),
            image_url: img.image_url,
            title: img.title || '',
            subtitle: img.subtitle || '',
            hide_text: img.hide_text,
            active: img.active,
            created_at: img.created_at,
        }))

        return NextResponse.json({ success: true, data: mapped })
    } catch (error) {
        console.error('Carousel GET error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// POST - Upload new carousel image
export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('image') as File | null

        // Zod validation for non-file fields
        const body = {
            title: formData.get('title') as string,
            subtitle: formData.get('subtitle') as string,
            hide_text: formData.get('hide_text') === 'true',
            active: formData.get('active') !== 'false'
        }

        const validation = carouselSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.format() }, { status: 400 })
        }
        const { title, subtitle, hide_text, active } = validation.data

        if (!file) {
            return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 })
        }

        // Upload to Cloudinary
        const buffer = Buffer.from(await file.arrayBuffer())
        const uploadResult = await uploadImage(buffer, 'carousel')

        if (!uploadResult.success || !uploadResult.url) {
            return NextResponse.json(
                { success: false, error: uploadResult.error || 'Upload failed' },
                { status: 500 }
            )
        }

        // Save to MongoDB
        const db = await getDb()
        const result = await db.collection('home_carousel').insertOne({
            image_url: uploadResult.url,
            title: title,
            subtitle: subtitle,
            hide_text: hide_text,
            active: active,
            created_at: new Date(),
        })

        return NextResponse.json({
            success: true,
            data: {
                id: result.insertedId.toString(),
                image_url: uploadResult.url,
                title: title,
                subtitle: subtitle,
                hide_text: hide_text,
                active,
            },
        })
    } catch (error) {
        console.error('Carousel POST error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// PUT - Toggle hide_text or active
export async function PUT(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id, field } = await request.json()

        if (!id || !['hide_text', 'active'].includes(field)) {
            return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
        }

        const db = await getDb()
        const doc = await db
            .collection('home_carousel')
            .findOne({ _id: new ObjectId(id) })

        if (!doc) {
            return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
        }

        await db
            .collection('home_carousel')
            .updateOne(
                { _id: new ObjectId(id) },
                { $set: { [field]: !doc[field] } }
            )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Carousel PUT error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// PATCH - Update title and subtitle
export async function PATCH(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validation = carouselSchema.safeParse(body) // Validates optional fields

        if (!validation.success) {
            return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.format() }, { status: 400 })
        }

        if (!body.id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
        }

        const { id, title, subtitle } = body

        const db = await getDb()
        const result = await db
            .collection('home_carousel')
            .updateOne(
                { _id: new ObjectId(id) },
                { $set: { title: title || '', subtitle: subtitle || '' } }
            )

        if (result.matchedCount === 0) {
            return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Carousel PATCH error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// DELETE - Remove carousel image
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
        const doc = await db
            .collection('home_carousel')
            .findOne({ _id: new ObjectId(id) })

        if (doc) {
            await deleteImage(doc.image_url)
            await db
                .collection('home_carousel')
                .deleteOne({ _id: new ObjectId(id) })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Carousel DELETE error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
