import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { ObjectId } from 'mongodb'
import { getAdminSession } from '@/lib/auth-edge'
import { serviceSchema } from '@/lib/validation'
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

// GET - List all humanitarian services with search/filter
export async function GET(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = request.nextUrl
        const search = searchParams.get('search') || ''
        const country = searchParams.get('country') || ''
        const state = searchParams.get('state') || ''
        const date = searchParams.get('date') || ''

        const filter: Record<string, unknown> = {}

        if (search) {
            filter.$or = [
                { title_en: { $regex: search, $options: 'i' } },
                { title_ta: { $regex: search, $options: 'i' } },
            ]
        }
        if (country) filter.country = country
        if (state) filter.state = state
        if (date) filter.date = { $regex: date }

        const db = await getDb()
        const services = await db
            .collection('humanitarian_services')
            .find(filter)
            .sort({ date: -1, created_at: -1 })
            .toArray()

        const mapped = services.map((s) => ({
            id: s._id.toString(),
            title_en: s.title_en,
            title_ta: s.title_ta,
            country: s.country,
            state: s.state,
            district: s.district,
            city: s.city,
            date: s.date,
            description_en: s.description_en,
            description_ta: s.description_ta,
            image_url: s.image_url,
        }))

        return NextResponse.json({ success: true, data: mapped })
    } catch (error) {
        console.error('Admin Services GET error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// POST - Add new service
export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            console.log('Admin Services POST: No valid session')
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()

        // Parse form data to object for validation
        const rawData: Record<string, unknown> = {}
        formData.forEach((value, key) => {
            if (key !== 'image') rawData[key] = value
        })

        // Temporarily just check required fields manually or use partial schema if file is separate
        // For now, let's validate non-file fields
        const validation = serviceSchema.safeParse(rawData)
        if (!validation.success) {
            console.error('Validation Error for Service:', JSON.stringify(validation.error.format(), null, 2))
            return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.format() }, { status: 400 })
        }

        const file = formData.get('image') as File | null

        if (!file) {
            console.log('Admin Services POST: No image provided')
            return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        console.log(`Admin Services POST: Uploading image, size: ${buffer.length} bytes`)
        const uploadResult = await uploadImage(buffer, 'services')

        if (!uploadResult.success || !uploadResult.url) {
            console.error('Admin Services POST: Image upload failed', uploadResult.error)
            return NextResponse.json(
                { success: false, error: uploadResult.error || 'Upload failed' },
                { status: 500 }
            )
        }

        console.log('Admin Services POST: Image uploaded successfully')
        const db = await getDb()
        
        // Preserve rich text styling while removing unsafe markup
        let sanitizedTitleEn = ''
        let sanitizedTitleTa = ''
        let sanitizedDescEn = ''
        let sanitizedDescTa = ''
        try {
            sanitizedTitleEn = rawData.title_en ? sanitizeRichText(rawData.title_en as string) : ''
            sanitizedTitleTa = rawData.title_ta ? sanitizeRichText(rawData.title_ta as string) : ''
            sanitizedDescEn = rawData.description_en ? sanitizeHtml(rawData.description_en as string) : ''
            sanitizedDescTa = rawData.description_ta ? sanitizeHtml(rawData.description_ta as string) : ''
            console.log('Admin Services POST: HTML sanitized successfully')
        } catch (sanitizeError) {
            console.error('Admin Services POST: Sanitization error', sanitizeError)
            sanitizedTitleEn = (rawData.title_en as string) || ''
            sanitizedTitleTa = (rawData.title_ta as string) || ''
            sanitizedDescEn = (rawData.description_en as string) || ''
            sanitizedDescTa = (rawData.description_ta as string) || ''
        }
        
        const doc = {
            title_en: sanitizedTitleEn,
            title_ta: sanitizedTitleTa,
            country: rawData.country,
            state: rawData.state,
            district: rawData.district,
            city: rawData.city,
            date: rawData.date,
            description_en: sanitizedDescEn,
            description_ta: sanitizedDescTa,
            image_url: uploadResult.url,
            created_at: new Date(),
        }

        console.log('Admin Services POST: Inserting document to DB')
        const result = await db.collection('humanitarian_services').insertOne(doc)
        console.log('Admin Services POST: Document inserted successfully')

        return NextResponse.json({
            success: true,
            data: { id: result.insertedId.toString(), ...doc },
        })
    } catch (error) {
        console.error('Admin Services POST error:', error)
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
        console.error('Error message:', error instanceof Error ? error.message : String(error))
        return NextResponse.json({ 
            success: false, 
            error: 'Server error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}

// PUT - Update service
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
        const existing = await db.collection('humanitarian_services').findOne({ _id: new ObjectId(id) })
        if (!existing) {
            return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
        }

        // Preserve rich text styling while removing unsafe markup
        let sanitizedTitleEn = ''
        let sanitizedTitleTa = ''
        let sanitizedDescEn = ''
        let sanitizedDescTa = ''
        try {
            const titleEn = formData.get('title_en') as string
            const titleTa = formData.get('title_ta') as string
            const descEn = formData.get('description_en') as string
            const descTa = formData.get('description_ta') as string
            sanitizedTitleEn = titleEn ? sanitizeRichText(titleEn) : ''
            sanitizedTitleTa = titleTa ? sanitizeRichText(titleTa) : ''
            sanitizedDescEn = descEn ? sanitizeRichText(descEn) : ''
            sanitizedDescTa = descTa ? sanitizeRichText(descTa) : ''
        } catch (sanitizeError) {
            console.error('Admin Services PUT: Sanitization error', sanitizeError)
            sanitizedTitleEn = (formData.get('title_en') as string) || ''
            sanitizedTitleTa = (formData.get('title_ta') as string) || ''
            sanitizedDescEn = (formData.get('description_en') as string) || ''
            sanitizedDescTa = (formData.get('description_ta') as string) || ''
        }
        
        const update: Record<string, unknown> = {
            title_en: sanitizedTitleEn,
            title_ta: sanitizedTitleTa,
            country: formData.get('country') as string,
            state: formData.get('state') as string,
            district: formData.get('district') as string,
            city: formData.get('city') as string,
            date: formData.get('date') as string,
            description_en: sanitizedDescEn,
            description_ta: sanitizedDescTa,
        }

        // Handle optional new image
        const file = formData.get('image') as File | null
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const uploadResult = await uploadImage(buffer, 'services')
            if (uploadResult.success && uploadResult.url) {
                await deleteImage(existing.image_url)
                update.image_url = uploadResult.url
            }
        }

        await db.collection('humanitarian_services').updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin Services PUT error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// DELETE - Remove service
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
        const doc = await db.collection('humanitarian_services').findOne({ _id: new ObjectId(id) })

        if (doc) {
            await deleteImage(doc.image_url)
            await db.collection('humanitarian_services').deleteOne({ _id: new ObjectId(id) })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin Services DELETE error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
