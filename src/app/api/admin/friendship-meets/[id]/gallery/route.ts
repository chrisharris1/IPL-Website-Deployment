import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { v2 as cloudinary } from 'cloudinary'
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

// Helper to upload base64 image to Cloudinary
async function uploadImageToCloudinary(base64Image: string): Promise<{ url: string; public_id: string }> {
    ensureCloudinaryConfig()
    const result = await cloudinary.uploader.upload(base64Image, {
        folder: 'ipl/friendship-meets/gallery',
        resource_type: 'image',
    })
    return { url: result.secure_url, public_id: result.public_id }
}

// Helper to delete image from Cloudinary
async function deleteImageFromCloudinary(publicId: string): Promise<void> {
    ensureCloudinaryConfig()
    await cloudinary.uploader.destroy(publicId)
}

// GET: Fetch all gallery items for a friendship meet
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const db = await getDb()

        // Support both slug and ObjectId lookup
        let meetQuery: any
        try {
            // Try as ObjectId first
            if (ObjectId.isValid(id)) {
                meetQuery = { _id: new ObjectId(id) }
            } else {
                throw new Error('Not an ObjectId')
            }
        } catch {
            // Fallback to slug
            meetQuery = { slug: id }
        }

        // Verify meet exists and get its slug
        const meetCollection = db.collection('friendship_meets')
        const meet = await meetCollection.findOne(meetQuery)
        if (!meet) {
            return NextResponse.json({ success: false, error: 'Meet not found' }, { status: 404 })
        }

        // Use slug if available, otherwise use _id string
        const meetId = meet.slug || meet._id.toString()

        const collection = db.collection('gallery_items')
        const items = await collection
            .find({
                $or: [
                    { meet_id: meetId },
                    { meet_id: meet._id.toString() },
                    { meet_id: meet._id }
                ]
            })
            .sort({ date: -1, created_at: -1 })
            .toArray()

        const formattedItems = items.map((item) => ({
            id: item._id.toString(),
            meet_id: typeof item.meet_id === 'string' ? item.meet_id : item.meet_id.toString(),
            title_en: item.title_en || '',
            title_ta: item.title_ta || '',
            country: item.country || '',
            state: item.state || '',
            district: item.district || '',
            city: item.city || '',
            date: item.date || null,
            description_en: item.description_en || '',
            description_ta: item.description_ta || '',
            image: item.image || null,
            created_at: item.created_at,
        }))

        return NextResponse.json({ success: true, data: formattedItems })
    } catch (error) {
        console.error('GET gallery items error:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch gallery items' }, { status: 500 })
    }
}

// POST: Create a new gallery item
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const data = await request.json()

        // Validate required fields
        if (
            !data.title_en ||
            !data.country ||
            !data.state ||
            !data.district ||
            !data.city ||
            !data.date ||
            !data.description_en ||
            !data.image
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Title (English), country, state, district, city, date, description (English), and image are required',
                },
                { status: 400 }
            )
        }

        // Upload image to Cloudinary
        let image = null
        try {
            image = await uploadImageToCloudinary(data.image)
        } catch (error) {
            console.error('Image upload failed:', error)
            return NextResponse.json({ success: false, error: 'Image upload failed' }, { status: 500 })
        }

        const db = await getDb()

        // Support both slug and ObjectId lookup
        let meetQuery: any
        try {
            if (ObjectId.isValid(id)) {
                meetQuery = { _id: new ObjectId(id) }
            } else {
                throw new Error('Not an ObjectId')
            }
        } catch {
            meetQuery = { slug: id }
        }

        // Verify meet exists and get its slug
        const meetCollection = db.collection('friendship_meets')
        const meet = await meetCollection.findOne(meetQuery)
        if (!meet) {
            return NextResponse.json({ success: false, error: 'Friendship meet not found' }, { status: 404 })
        }

        // Use slug if available, otherwise use _id string
        const meetId = meet.slug || meet._id.toString()

        const galleryCollection = db.collection('gallery_items')

        const document = {
            meet_id: meetId, // Store as string (slug or ObjectId string)
            title_en: data.title_en,
            title_ta: data.title_ta || '',
            country: data.country,
            state: data.state,
            district: data.district,
            city: data.city,
            date: new Date(data.date),
            description_en: data.description_en,
            description_ta: data.description_ta || '',
            image,
            created_at: new Date(),
        }

        const result = await galleryCollection.insertOne(document)

        return NextResponse.json({
            success: true,
            data: { id: result.insertedId.toString(), ...document, meet_id: meetId },
        })
    } catch (error) {
        console.error('POST gallery item error:', error)
        return NextResponse.json({ success: false, error: 'Failed to create gallery item' }, { status: 500 })
    }
}

// PUT: Update a gallery item
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const data = await request.json()

        if (!data.item_id || !ObjectId.isValid(data.item_id)) {
            return NextResponse.json({ success: false, error: 'Invalid item ID' }, { status: 400 })
        }

        const db = await getDb()

        // Support both slug and ObjectId lookup for the meet
        let meetQuery: any
        try {
            if (ObjectId.isValid(id)) {
                meetQuery = { _id: new ObjectId(id) }
            } else {
                throw new Error('Not an ObjectId')
            }
        } catch {
            meetQuery = { slug: id }
        }

        // Find meet to get canonical ID
        const meetCollection = db.collection('friendship_meets')
        const meet = await meetCollection.findOne(meetQuery)
        if (!meet) {
            return NextResponse.json({ success: false, error: 'Friendship meet not found' }, { status: 404 })
        }

        const meetId = meet.slug || meet._id.toString()
        const galleryCollection = db.collection('gallery_items')
        const itemId = new ObjectId(data.item_id)

        // Find existing item with lenient meet_id check
        const existingItem = await galleryCollection.findOne({
            _id: itemId,
            $or: [
                { meet_id: meetId },
                { meet_id: meet._id.toString() },
                { meet_id: meet._id }
            ]
        })

        if (!existingItem) {
            return NextResponse.json({ success: false, error: 'Gallery item not found' }, { status: 404 })
        }

        let image = existingItem.image || null

        // Update image if provided
        if (data.new_image) {
            // Delete old image
            if (image?.public_id) {
                try {
                    await deleteImageFromCloudinary(image.public_id)
                } catch (error) {
                    console.error('Old image deletion failed:', error)
                }
            }
            // Upload new image
            try {
                image = await uploadImageToCloudinary(data.new_image)
            } catch (error) {
                console.error('New image upload failed:', error)
                return NextResponse.json({ success: false, error: 'Image upload failed' }, { status: 500 })
            }
        }

        const updateData = {
            title_en: data.title_en !== undefined ? data.title_en : existingItem.title_en,
            title_ta: data.title_ta !== undefined ? data.title_ta : existingItem.title_ta,
            country: data.country || existingItem.country,
            state: data.state || existingItem.state,
            district: data.district || existingItem.district,
            city: data.city || existingItem.city,
            date: data.date ? new Date(data.date) : existingItem.date,
            description_en: data.description_en !== undefined ? data.description_en : existingItem.description_en,
            description_ta: data.description_ta !== undefined ? data.description_ta : existingItem.description_ta,
            image,
        }

        await galleryCollection.updateOne({ _id: itemId }, { $set: updateData })

        return NextResponse.json({
            success: true,
            message: 'Gallery item updated successfully',
        })
    } catch (error) {
        console.error('PUT gallery item error:', error)
        return NextResponse.json({ success: false, error: 'Failed to update gallery item' }, { status: 500 })
    }
}

// DELETE: Delete a gallery item
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const data = await request.json()

        if (!data.item_id || !ObjectId.isValid(data.item_id)) {
            return NextResponse.json({ success: false, error: 'Invalid item ID' }, { status: 400 })
        }

        const db = await getDb()

        // Support both slug and ObjectId lookup
        let meetQuery: any
        try {
            if (ObjectId.isValid(id)) {
                meetQuery = { _id: new ObjectId(id) }
            } else {
                throw new Error('Not an ObjectId')
            }
        } catch {
            meetQuery = { slug: id }
        }

        // Find meet to get canonical ID
        const meetCollection = db.collection('friendship_meets')
        const meet = await meetCollection.findOne(meetQuery)
        if (!meet) {
            return NextResponse.json({ success: false, error: 'Friendship meet not found' }, { status: 404 })
        }

        const meetId = meet.slug || meet._id.toString()
        const galleryCollection = db.collection('gallery_items')
        const itemId = new ObjectId(data.item_id)

        // Find existing item with lenient meet_id check
        const item = await galleryCollection.findOne({
            _id: itemId,
            $or: [
                { meet_id: meetId },
                { meet_id: meet._id.toString() },
                { meet_id: meet._id }
            ]
        })

        if (!item) {
            return NextResponse.json({ success: false, error: 'Gallery item not found' }, { status: 404 })
        }

        // Delete image from Cloudinary
        if (item.image?.public_id) {
            try {
                await deleteImageFromCloudinary(item.image.public_id)
            } catch (error) {
                console.error('Image deletion failed:', error)
            }
        }

        await galleryCollection.deleteOne({ _id: itemId })

        return NextResponse.json({
            success: true,
            message: 'Gallery item deleted successfully',
        })
    } catch (error) {
        console.error('DELETE gallery item error:', error)
        return NextResponse.json({ success: false, error: 'Failed to delete gallery item' }, { status: 500 })
    }
}
