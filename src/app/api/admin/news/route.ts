import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { ObjectId } from 'mongodb'
import { getAdminSession } from '@/lib/auth-edge'
import { newsSchema } from '@/lib/validation'
import DOMPurify from 'isomorphic-dompurify'

// GET - List all news events
export async function GET() {
    try {
        console.log('Admin News GET: Starting request')
        const session = await getAdminSession()
        if (!session) {
            console.log('Admin News GET: No valid session')
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }
        console.log('Admin News GET: Session validated')

        console.log('Admin News GET: Connecting to database')
        const db = await getDb()
        console.log('Admin News GET: Database connected, fetching events')
        
        const events = await db
            .collection('news_events')
            .find({})
            .sort({ date: -1, time: -1 })
            .toArray()

        console.log(`Admin News GET: Found ${events.length} events`)

        const mapped = events.map((e) => ({
            id: e._id.toString(),
            title_en: e.title_en,
            title_ta: e.title_ta,
            country: e.country,
            state: e.state,
            district: e.district,
            city: e.city,
            date: e.date,
            time: e.time,
            description_en: e.description_en,
            description_ta: e.description_ta,
            image_url: e.image_url,
        }))

        console.log('Admin News GET: Returning success response')
        return NextResponse.json({ success: true, data: mapped })
    } catch (error) {
        console.error('Admin News GET error:', error)
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
        return NextResponse.json({ 
            success: false, 
            error: 'Server error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}

// POST - Add new event
export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            console.log('Admin News POST: No valid session')
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('image') as File | null

        if (!file) {
            console.log('Admin News POST: No image provided')
            return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 })
        }

        const body = {
            title_en: formData.get('title_en'),
            title_ta: formData.get('title_ta'),
            country: formData.get('country'),
            state: formData.get('state'),
            district: formData.get('district'),
            city: formData.get('city'),
            date: formData.get('date'),
            time: formData.get('time'),
            description_en: formData.get('description_en'),
            description_ta: formData.get('description_ta'),
        }

        const validation = newsSchema.safeParse(body)
        if (!validation.success) {
            console.log('Admin News POST: Validation failed', validation.error)
            return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.format() }, { status: 400 })
        }
        const data = validation.data

        const buffer = Buffer.from(await file.arrayBuffer())
        console.log(`Admin News POST: Uploading image, size: ${buffer.length} bytes`)
        const uploadResult = await uploadImage(buffer, 'news')

        if (!uploadResult.success || !uploadResult.url) {
            console.error('Admin News POST: Image upload failed', uploadResult.error)
            return NextResponse.json(
                { success: false, error: uploadResult.error || 'Upload failed' },
                { status: 500 }
            )
        }

        console.log('Admin News POST: Image uploaded successfully')
        const db = await getDb()
        
        // Sanitize HTML content
        let sanitizedDescEn = ''
        let sanitizedDescTa = ''
        try {
            sanitizedDescEn = data.description_en ? DOMPurify.sanitize(data.description_en) : ''
            sanitizedDescTa = data.description_ta ? DOMPurify.sanitize(data.description_ta) : ''
            console.log('Admin News POST: HTML sanitized successfully')
        } catch (sanitizeError) {
            console.error('Admin News POST: Sanitization error', sanitizeError)
            // Continue without sanitization if it fails
            sanitizedDescEn = data.description_en || ''
            sanitizedDescTa = data.description_ta || ''
        }
        
        const doc = {
            ...data,
            description_en: sanitizedDescEn,
            description_ta: sanitizedDescTa,
            image_url: uploadResult.url,
            created_at: new Date(),
        }

        console.log('Admin News POST: Inserting document to DB')
        const result = await db.collection('news_events').insertOne(doc)
        console.log('Admin News POST: Document inserted successfully')

        return NextResponse.json({
            success: true,
            data: { id: result.insertedId.toString(), ...doc },
        })
    } catch (error) {
        console.error('Admin News POST error:', error)
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
        console.error('Error message:', error instanceof Error ? error.message : String(error))
        return NextResponse.json({ 
            success: false, 
            error: 'Server error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}

// PUT - Update event
export async function PUT(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const id = formData.get('id') as string

        if (!id) {
            return NextResponse.json({ success: false, error: 'No ID provided' }, { status: 400 })
        }

        const db = await getDb()
        const existing = await db.collection('news_events').findOne({ _id: new ObjectId(id) })
        if (!existing) {
            return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
        }

        const body = {
            title_en: formData.get('title_en'),
            title_ta: formData.get('title_ta'),
            country: formData.get('country'),
            state: formData.get('state'),
            district: formData.get('district'),
            city: formData.get('city'),
            date: formData.get('date'),
            time: formData.get('time'),
            description_en: formData.get('description_en'),
            description_ta: formData.get('description_ta'),
            id,
        }

        const validation = newsSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.format() }, { status: 400 })
        }
        const data = validation.data

        // Sanitize HTML content
        let sanitizedDescEn = ''
        let sanitizedDescTa = ''
        try {
            sanitizedDescEn = data.description_en ? DOMPurify.sanitize(data.description_en) : ''
            sanitizedDescTa = data.description_ta ? DOMPurify.sanitize(data.description_ta) : ''
        } catch (sanitizeError) {
            console.error('Admin News PUT: Sanitization error', sanitizeError)
            // Continue without sanitization if it fails
            sanitizedDescEn = data.description_en || ''
            sanitizedDescTa = data.description_ta || ''
        }

        const update: Record<string, unknown> = {
            ...data,
            description_en: sanitizedDescEn,
            description_ta: sanitizedDescTa,
        }
        // Remove id from update object
        delete update.id

        const file = formData.get('image') as File | null
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const uploadResult = await uploadImage(buffer, 'news')
            if (uploadResult.success && uploadResult.url) {
                await deleteImage(existing.image_url)
                update.image_url = uploadResult.url
            }
        }

        await db.collection('news_events').updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin News PUT error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// DELETE - Remove event
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
        const doc = await db.collection('news_events').findOne({ _id: new ObjectId(id) })

        if (doc) {
            await deleteImage(doc.image_url)
            await db.collection('news_events').deleteOne({ _id: new ObjectId(id) })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin News DELETE error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
