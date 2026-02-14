import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { ObjectId } from 'mongodb'
import { getAdminSession } from '@/lib/auth-edge'
import { presidentBlogSchema } from '@/lib/validation'
import DOMPurify from 'isomorphic-dompurify'

export async function GET(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = request.nextUrl
        const search = searchParams.get('search') || ''
        const filter: any = {}
        if (search) {
            filter.$or = [
                { title_en: { $regex: search, $options: 'i' } },
                { title_ta: { $regex: search, $options: 'i' } },
            ]
        }

        const db = await getDb()
        const posts = await db
            .collection('president_blog')
            .find(filter)
            .sort({ date: -1, created_at: -1 })
            .toArray()

        const mapped = posts.map((p) => ({
            id: p._id.toString(),
            title_en: p.title_en || '',
            title_ta: p.title_ta || '',
            description_en: p.description_en || '',
            description_ta: p.description_ta || '',
            image_url: p.image_url || '',
        }))

        return NextResponse.json({ success: true, data: mapped })
    } catch (error) {
        console.error('Admin President Blog GET error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('image') as File | null

        if (!file) {
            return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 })
        }

        const body = {
            title_en: formData.get('title_en'),
            title_ta: formData.get('title_ta'),
            description_en: formData.get('description_en'),
            description_ta: formData.get('description_ta'),
        }

        const validation = presidentBlogSchema.safeParse(body)
        if (!validation.success) {
            console.error('Validation Error:', JSON.stringify(validation.error.format(), null, 2))
            return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.format() }, { status: 400 })
        }
        const { title_en, title_ta, description_en, description_ta } = validation.data

        const buffer = Buffer.from(await file.arrayBuffer())
        const uploadResult = await uploadImage(buffer, 'president-blog')

        if (!uploadResult.success || !uploadResult.url) {
            return NextResponse.json(
                { success: false, error: uploadResult.error || 'Upload failed' },
                { status: 500 }
            )
        }

        const db = await getDb()
        const doc = {
            title_en: title_en || '',
            title_ta: title_ta || '',
            description_en: description_en ? DOMPurify.sanitize(description_en) : '',
            description_ta: description_ta ? DOMPurify.sanitize(description_ta) : '',
            image_url: uploadResult.url,
            created_at: new Date(),
        }

        const result = await db.collection('president_blog').insertOne(doc)

        return NextResponse.json({
            success: true,
            data: { id: result.insertedId.toString(), ...doc },
        })
    } catch (error) {
        console.error('Admin President Blog POST error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

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

        const body = {
            title_en: formData.get('title_en'),
            title_ta: formData.get('title_ta'),
            description_en: formData.get('description_en'),
            description_ta: formData.get('description_ta'),
            id,
        }

        const validation = presidentBlogSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.format() }, { status: 400 })
        }
        const { title_en, title_ta, description_en, description_ta } = validation.data

        const db = await getDb()
        const existing = await db.collection('president_blog').findOne({ _id: new ObjectId(id) })
        if (!existing) {
            return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
        }

        const update: Record<string, unknown> = {
            title_en: title_en || '',
            title_ta: title_ta || '',
            description_en: description_en ? DOMPurify.sanitize(description_en) : '',
            description_ta: description_ta ? DOMPurify.sanitize(description_ta) : '',
        }

        const file = formData.get('image') as File | null
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const uploadResult = await uploadImage(buffer, 'president-blog')
            if (uploadResult.success && uploadResult.url) {
                await deleteImage(existing.image_url)
                update.image_url = uploadResult.url
            }
        }

        await db.collection('president_blog').updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin President Blog PUT error:', error)
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
        const doc = await db.collection('president_blog').findOne({ _id: new ObjectId(id) })

        if (doc) {
            await deleteImage(doc.image_url)
            await db.collection('president_blog').deleteOne({ _id: new ObjectId(id) })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin President Blog DELETE error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
