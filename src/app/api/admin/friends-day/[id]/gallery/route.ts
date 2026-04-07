import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { v2 as cloudinary } from 'cloudinary'

import { getDb } from '@/lib/mongodb'
import { getAdminSession } from '@/lib/auth-edge'

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
        folder: 'ipl/friends-day/gallery',
        resource_type: 'image',
    })
    return { url: result.secure_url, public_id: result.public_id }
}

async function deleteImageFromCloudinary(publicId: string): Promise<void> {
    ensureCloudinaryConfig()
    await cloudinary.uploader.destroy(publicId)
}

async function findCard(db: any, id: string) {
    if (ObjectId.isValid(id)) {
        return db.collection('friends_day_events').findOne({ _id: new ObjectId(id) })
    }
    return null
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const db = await getDb()
        const card = await findCard(db, id)

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
        console.error('Admin Friends Day Gallery GET error:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch gallery items' }, { status: 500 })
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()

        if (!body.image || !String(body.image).trim()) {
            return NextResponse.json({ success: false, error: 'Image is required' }, { status: 400 })
        }

        const db = await getDb()
        const card = await findCard(db, id)
        if (!card) {
            return NextResponse.json({ success: false, error: 'Friends Day card not found' }, { status: 404 })
        }

        const image = await uploadImageToCloudinary(body.image)

        const doc = {
            card_id: card._id.toString(),
            title_en: body.title_en || '',
            title_ta: body.title_ta || '',
            description_en: body.description_en || '',
            description_ta: body.description_ta || '',
            image,
            created_at: new Date(),
            updated_at: new Date(),
        }

        const result = await db.collection('friends_day_gallery_items').insertOne(doc)

        return NextResponse.json({ success: true, data: { id: result.insertedId.toString(), ...doc } })
    } catch (error) {
        console.error('Admin Friends Day Gallery POST error:', error)
        return NextResponse.json({ success: false, error: 'Failed to add gallery item' }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()

        if (!body.item_id || !ObjectId.isValid(body.item_id)) {
            return NextResponse.json({ success: false, error: 'Valid item_id is required' }, { status: 400 })
        }

        const db = await getDb()
        const card = await findCard(db, id)
        if (!card) {
            return NextResponse.json({ success: false, error: 'Friends Day card not found' }, { status: 404 })
        }

        const item = await db.collection('friends_day_gallery_items').findOne({
            _id: new ObjectId(body.item_id),
            card_id: card._id.toString(),
        })

        if (!item) {
            return NextResponse.json({ success: false, error: 'Gallery item not found' }, { status: 404 })
        }

        let image = item.image || null
        if (body.new_image) {
            if (image?.public_id) {
                try {
                    await deleteImageFromCloudinary(image.public_id)
                } catch (error) {
                    console.error('Failed to delete old image:', error)
                }
            }
            image = await uploadImageToCloudinary(body.new_image)
        }

        await db.collection('friends_day_gallery_items').updateOne(
            { _id: new ObjectId(body.item_id) },
            {
                $set: {
                    title_en: body.title_en !== undefined ? body.title_en : item.title_en,
                    title_ta: body.title_ta !== undefined ? body.title_ta : item.title_ta,
                    description_en: body.description_en !== undefined ? body.description_en : item.description_en,
                    description_ta: body.description_ta !== undefined ? body.description_ta : item.description_ta,
                    image,
                    updated_at: new Date(),
                },
            }
        )

        return NextResponse.json({ success: true, message: 'Gallery item updated' })
    } catch (error) {
        console.error('Admin Friends Day Gallery PUT error:', error)
        return NextResponse.json({ success: false, error: 'Failed to update gallery item' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()

        if (!body.item_id || !ObjectId.isValid(body.item_id)) {
            return NextResponse.json({ success: false, error: 'Valid item_id is required' }, { status: 400 })
        }

        const db = await getDb()
        const card = await findCard(db, id)
        if (!card) {
            return NextResponse.json({ success: false, error: 'Friends Day card not found' }, { status: 404 })
        }

        const item = await db.collection('friends_day_gallery_items').findOne({
            _id: new ObjectId(body.item_id),
            card_id: card._id.toString(),
        })

        if (!item) {
            return NextResponse.json({ success: false, error: 'Gallery item not found' }, { status: 404 })
        }

        if (item.image?.public_id) {
            try {
                await deleteImageFromCloudinary(item.image.public_id)
            } catch (error) {
                console.error('Failed to delete image:', error)
            }
        }

        await db.collection('friends_day_gallery_items').deleteOne({ _id: new ObjectId(body.item_id) })

        return NextResponse.json({ success: true, message: 'Gallery item deleted' })
    } catch (error) {
        console.error('Admin Friends Day Gallery DELETE error:', error)
        return NextResponse.json({ success: false, error: 'Failed to delete gallery item' }, { status: 500 })
    }
}
