import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { v2 as cloudinary } from 'cloudinary'
import sanitizeHtml from 'sanitize-html'

import { getDb } from '@/lib/mongodb'
import { getAdminSession } from '@/lib/auth-edge'

const sanitizeRichText = (html: string) =>
    sanitizeHtml(html || '', {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['span', 'p', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
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
                color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^rgba\(/, /^[a-zA-Z]+$/],
                'font-size': [/^\d+(?:\.\d+)?(?:px|em|rem|%)$/],
                'font-family': [/^[\w\s,\'"-]+$/],
                'text-decoration': [/^underline$/, /^line-through$/, /^none$/],
                'font-weight': [/^\d{3}$/, /^bold$/, /^normal$/],
                'font-style': [/^italic$/, /^normal$/],
            },
        },
    })

function ensureCloudinaryConfig() {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error('Cloudinary environment variables are not configured')
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })
}

async function uploadImageToCloudinary(base64Image: string): Promise<{ url: string; public_id: string }> {
    ensureCloudinaryConfig()
    const result = await cloudinary.uploader.upload(base64Image, {
        folder: 'ipl/friends-day',
        resource_type: 'image',
    })

    return { url: result.secure_url, public_id: result.public_id }
}

async function deleteImageFromCloudinary(publicId: string): Promise<void> {
    ensureCloudinaryConfig()
    await cloudinary.uploader.destroy(publicId)
}

export async function GET() {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const db = await getDb()
        const events = await db
            .collection('friends_day_events')
            .find({})
            .sort({ created_at: -1 })
            .toArray()

        return NextResponse.json({
            success: true,
            data: events.map((event) => ({
                id: event._id.toString(),
                title_en: event.title_en || '',
                title_ta: event.title_ta || '',
                description_en: event.description_en || '',
                description_ta: event.description_ta || '',
                image: event.image || null,
                created_at: event.created_at,
                updated_at: event.updated_at,
            })),
        })
    } catch (error) {
        console.error('Admin Friends Day Events GET error:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch friends day cards' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        if (!body.title_en || !String(body.title_en).trim()) {
            return NextResponse.json({ success: false, error: 'Title (English) is required' }, { status: 400 })
        }

        let image = null
        if (body.image_base64) {
            image = await uploadImageToCloudinary(body.image_base64)
        }

        const db = await getDb()
        const doc = {
            title_en: sanitizeRichText(body.title_en || ''),
            title_ta: sanitizeRichText(body.title_ta || ''),
            description_en: sanitizeRichText(body.description_en || ''),
            description_ta: sanitizeRichText(body.description_ta || ''),
            image,
            created_at: new Date(),
            updated_at: new Date(),
        }

        const result = await db.collection('friends_day_events').insertOne(doc)

        return NextResponse.json({
            success: true,
            data: { id: result.insertedId.toString(), ...doc },
            message: 'Friends Day card created successfully',
        })
    } catch (error) {
        console.error('Admin Friends Day Events POST error:', error)
        return NextResponse.json({ success: false, error: 'Failed to create friends day card' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        if (!body.id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
        }

        const db = await getDb()
        const existing = await db.collection('friends_day_events').findOne({ _id: new ObjectId(body.id) })

        if (!existing) {
            return NextResponse.json({ success: false, error: 'Friends Day card not found' }, { status: 404 })
        }

        let image = existing.image || null
        if (body.image_base64) {
            if (image?.public_id) {
                try {
                    await deleteImageFromCloudinary(image.public_id)
                } catch (error) {
                    console.error('Old Friends Day image delete failed:', error)
                }
            }
            image = await uploadImageToCloudinary(body.image_base64)
        }

        const updateDoc = {
            title_en: body.title_en !== undefined ? sanitizeRichText(body.title_en) : existing.title_en,
            title_ta: body.title_ta !== undefined ? sanitizeRichText(body.title_ta) : existing.title_ta,
            description_en: body.description_en !== undefined ? sanitizeRichText(body.description_en) : existing.description_en,
            description_ta: body.description_ta !== undefined ? sanitizeRichText(body.description_ta) : existing.description_ta,
            image,
            updated_at: new Date(),
        }

        await db.collection('friends_day_events').updateOne(
            { _id: new ObjectId(body.id) },
            { $set: updateDoc }
        )

        return NextResponse.json({ success: true, message: 'Friends Day card updated successfully' })
    } catch (error) {
        console.error('Admin Friends Day Events PUT error:', error)
        return NextResponse.json({ success: false, error: 'Failed to update friends day card' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        if (!body.id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
        }

        const db = await getDb()
        const existing = await db.collection('friends_day_events').findOne({ _id: new ObjectId(body.id) })

        if (!existing) {
            return NextResponse.json({ success: false, error: 'Friends Day card not found' }, { status: 404 })
        }

        if (existing.image?.public_id) {
            try {
                await deleteImageFromCloudinary(existing.image.public_id)
            } catch (error) {
                console.error('Friends Day image delete failed:', error)
            }
        }

        await db.collection('friends_day_events').deleteOne({ _id: new ObjectId(body.id) })

        return NextResponse.json({ success: true, message: 'Friends Day card deleted successfully' })
    } catch (error) {
        console.error('Admin Friends Day Events DELETE error:', error)
        return NextResponse.json({ success: false, error: 'Failed to delete friends day card' }, { status: 500 })
    }
}
