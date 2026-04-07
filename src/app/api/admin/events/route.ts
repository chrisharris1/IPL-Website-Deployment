import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { v2 as cloudinary } from 'cloudinary'
import { ObjectId } from 'mongodb'
import { getAdminSession } from '@/lib/auth-edge'
import sanitizeHtml from 'sanitize-html'

const sanitizeConfig = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'span', 'p', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li']),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'title', 'width', 'height'],
        span: ['style'],
        p: ['style'],
        div: ['style'],
        h1: ['style'],
        h2: ['style'],
        h3: ['style'],
        h4: ['style'],
        h5: ['style'],
        h6: ['style'],
        li: ['style'],
    },
    allowedStyles: {
        '*': {
            color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^rgba\(/, /^[a-zA-Z]+$/],
            'font-size': [/^\d+(?:\.\d+)?(?:px|em|rem|%)$/],
            'font-family': [/^[\w\s,'"-]+$/],
            'text-decoration': [/^underline$/, /^line-through$/, /^none$/],
            'font-weight': [/^\d{3}$/, /^bold$/, /^normal$/],
            'font-style': [/^italic$/, /^normal$/],
        },
    },
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Helper to upload base64 image to Cloudinary
async function uploadImageToCloudinary(base64Image: string): Promise<{ url: string; public_id: string }> {
    const result = await cloudinary.uploader.upload(base64Image, {
        folder: 'ipl/events',
        resource_type: 'image',
    })
    return { url: result.secure_url, public_id: result.public_id }
}

// Helper to delete image from Cloudinary
async function deleteImageFromCloudinary(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId)
}

// GET - List all events
export async function GET() {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const db = await getDb()
        const events = await db
            .collection('events')
            .find({})
            .sort({ date: -1, createdAt: -1 })
            .toArray()

        const mapped = events.map((e) => ({
            id: e._id.toString(),
            newsId: e.newsId,
            title_en: e.title_en || '',
            title_ta: e.title_ta || '',
            description_en: e.description_en || '',
            description_ta: e.description_ta || '',
            posterImage: e.posterImage || '',
            photos: e.photos || [],
            date: e.date,
            createdAt: e.createdAt,
        }))

        return NextResponse.json({ success: true, data: mapped })
    } catch (error) {
        console.error('Admin Events GET error:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch events' }, { status: 500 })
    }
}

// POST - Create or Update event
export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { id, newsId, title_en, title_ta, description_en, description_ta, photos, date } = body

        const sanitizedData = {
            newsId: newsId || null,
            title_en: title_en ? sanitizeHtml(title_en, sanitizeConfig) : '',
            title_ta: title_ta ? sanitizeHtml(title_ta, sanitizeConfig) : '',
            description_en: description_en ? sanitizeHtml(description_en, sanitizeConfig) : '',
            description_ta: description_ta ? sanitizeHtml(description_ta, sanitizeConfig) : '',
            photos: photos || [],
            date: date || new Date().toISOString().split('T')[0],
        }

        const db = await getDb()

        if (id) {
            // Update existing event
            const result = await db.collection('events').updateOne(
                { _id: new ObjectId(id) },
                { $set: { ...sanitizedData, updatedAt: new Date() } }
            )

            if (result.matchedCount === 0) {
                return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 })
            }

            return NextResponse.json({ success: true, message: 'Event updated successfully' })
        } else {
            // Create new event
            const result = await db.collection('events').insertOne({
                ...sanitizedData,
                createdAt: new Date(),
                updatedAt: new Date(),
            })

            return NextResponse.json({
                success: true,
                message: 'Event created successfully',
                id: result.insertedId.toString(),
            })
        }
    } catch (error) {
        console.error('Admin Events POST error:', error)
        return NextResponse.json({ success: false, error: 'Failed to save event' }, { status: 500 })
    }
}

// PUT - Upload photos to event
export async function PUT(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { id, photoBase64 } = body

        if (!id || !photoBase64) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
        }

        // Upload photo to Cloudinary
        const uploadedImage = await uploadImageToCloudinary(photoBase64)

        const db = await getDb()
        
        // Add photo to event's photos array
        const result = await db.collection('events').updateOne(
            { _id: new ObjectId(id) },
            { 
                $push: { 
                    photos: {
                        url: uploadedImage.url,
                        public_id: uploadedImage.public_id,
                        uploadedAt: new Date()
                    }
                } as any,
                $set: { updatedAt: new Date() }
            }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: 'Photo uploaded successfully',
            photo: {
                url: uploadedImage.url,
                public_id: uploadedImage.public_id
            }
        })
    } catch (error) {
        console.error('Admin Events PUT error:', error)
        return NextResponse.json({ success: false, error: 'Failed to upload photo' }, { status: 500 })
    }
}

// DELETE - Delete event or photo
export async function DELETE(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = request.nextUrl
        const id = searchParams.get('id')
        const photoPublicId = searchParams.get('photoPublicId')

        if (!id) {
            return NextResponse.json({ success: false, error: 'Missing event ID' }, { status: 400 })
        }

        const db = await getDb()

        if (photoPublicId) {
            // Delete specific photo from event
            try {
                await deleteImageFromCloudinary(photoPublicId)
            } catch (error) {
                console.error('Failed to delete image from Cloudinary:', error)
            }

            const result = await db.collection('events').updateOne(
                { _id: new ObjectId(id) },
                { 
                    $pull: { photos: { public_id: photoPublicId } } as any,
                    $set: { updatedAt: new Date() }
                }
            )

            if (result.matchedCount === 0) {
                return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 })
            }

            return NextResponse.json({ success: true, message: 'Photo deleted successfully' })
        } else {
            // Delete entire event
            const event = await db.collection('events').findOne({ _id: new ObjectId(id) })
            
            if (!event) {
                return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 })
            }

            // Delete all photos from Cloudinary
            if (event.photos && Array.isArray(event.photos)) {
                for (const photo of event.photos) {
                    try {
                        if (photo.public_id) {
                            await deleteImageFromCloudinary(photo.public_id)
                        }
                    } catch (error) {
                        console.error('Failed to delete image from Cloudinary:', error)
                    }
                }
            }

            await db.collection('events').deleteOne({ _id: new ObjectId(id) })

            return NextResponse.json({ success: true, message: 'Event deleted successfully' })
        }
    } catch (error) {
        console.error('Admin Events DELETE error:', error)
        return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 })
    }
}
