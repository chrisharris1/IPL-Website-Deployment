import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Helper to generate URL-friendly slug from location and year
function generateSlug(district: string, state: string, country: string, year: number): string {
    const normalize = (str: string) => 
        str.toLowerCase()
           .replace(/[^a-z0-9]+/g, '-')
           .replace(/^-+|-+$/g, '')
    
    const parts = [normalize(district), normalize(state), normalize(country), year.toString()]
    return parts.filter(Boolean).join('-')
}

// Helper to ensure unique slug
async function ensureUniqueSlug(db: any, baseSlug: string, excludeId?: ObjectId): Promise<string> {
    const collection = db.collection('friendship_meets')
    let slug = baseSlug
    let counter = 1
    
    while (true) {
        const query: any = { slug }
        if (excludeId) query._id = { $ne: excludeId }
        
        const existing = await collection.findOne(query)
        if (!existing) return slug
        
        slug = `${baseSlug}-${counter}`
        counter++
    }
}

// Helper to upload base64 image to Cloudinary
async function uploadImageToCloudinary(base64Image: string): Promise<{ url: string; public_id: string }> {
    const result = await cloudinary.uploader.upload(base64Image, {
        folder: 'friendship-meets',
        resource_type: 'image',
    })
    return { url: result.secure_url, public_id: result.public_id }
}

// Helper to delete image from Cloudinary
async function deleteImageFromCloudinary(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId)
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const country = searchParams.get('country')
        const state = searchParams.get('state')
        const district = searchParams.get('district')
        const year = searchParams.get('year')

        const db = await getDb()
        const collection = db.collection('friendship_meets')

        const filter: any = {}
        if (country) filter.country = country
        if (state) filter.state = state
        if (district) filter.district = district
        if (year) filter.year = parseInt(year)

        const meets = await collection
            .find(filter)
            .sort({ year: -1, created_at: -1 })
            .toArray()

        // Auto-migrate: Add slugs to records that don't have them
        const updates = []
        for (const meet of meets) {
            if (!meet.slug) {
                const baseSlug = generateSlug(meet.district, meet.state, meet.country, meet.year)
                const slug = await ensureUniqueSlug(db, baseSlug, meet._id)
                updates.push(
                    collection.updateOne(
                        { _id: meet._id },
                        { $set: { slug, updated_at: new Date() } }
                    )
                )
                meet.slug = slug // Update in memory for response
            }
        }
        if (updates.length > 0) {
            await Promise.all(updates)
        }

        const formattedMeets = meets.map((meet) => ({
            id: meet.slug || meet._id.toString(), // Use slug if available, fallback to ObjectId
            _id: meet._id.toString(), // Keep original ID for internal use
            slug: meet.slug,
            country: meet.country,
            state: meet.state,
            district: meet.district,
            year: meet.year,
            caption_en: meet.caption_en || '',
            caption_ta: meet.caption_ta || '',
            banner_image: meet.banner_image || null,
            created_at: meet.created_at,
            updated_at: meet.updated_at,
        }))

        return NextResponse.json({ success: true, data: formattedMeets })
    } catch (error) {
        console.error('GET friendship meets error:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch friendship meets' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json()

        // Validate required fields
        if (!data.country || !data.state || !data.district || !data.year) {
            return NextResponse.json(
                { success: false, error: 'Country, state, district, and year are required' },
                { status: 400 }
            )
        }

        // Upload banner image
        let banner_image = null
        if (data.banner_image) {
            try {
                banner_image = await uploadImageToCloudinary(data.banner_image)
            } catch (error) {
                console.error('Banner image upload failed:', error)
            }
        }

        const db = await getDb()
        const collection = db.collection('friendship_meets')

        // Generate slug
        const baseSlug = generateSlug(data.district, data.state, data.country, parseInt(data.year))
        const slug = await ensureUniqueSlug(db, baseSlug)

        const document = {
            slug,
            country: data.country,
            state: data.state,
            district: data.district,
            year: parseInt(data.year),
            caption_en: data.caption_en || '',
            caption_ta: data.caption_ta || '',
            banner_image,
            created_at: new Date(),
            updated_at: new Date(),
        }

        const result = await collection.insertOne(document)

        return NextResponse.json({
            success: true,
            data: { id: slug, _id: result.insertedId.toString(), ...document },
            message: 'Friendship meet created successfully',
        })
    } catch (error) {
        console.error('POST friendship meet error:', error)
        return NextResponse.json({ success: false, error: 'Failed to create friendship meet' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json()

        if (!data.id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
        }

        const db = await getDb()
        const collection = db.collection('friendship_meets')

        // Support both ObjectId and slug for lookup
        let query: any
        try {
            query = { _id: new ObjectId(data.id) }
        } catch {
            query = { slug: data.id }
        }

        const existingMeet = await collection.findOne(query)

        if (!existingMeet) {
            return NextResponse.json({ success: false, error: 'Friendship meet not found' }, { status: 404 })
        }

        let banner_image = existingMeet.banner_image || null

        // Update banner image if provided
        if (data.new_banner_image) {
            // Delete old banner if exists
            if (banner_image?.public_id) {
                try {
                    await deleteImageFromCloudinary(banner_image.public_id)
                } catch (error) {
                    console.error('Old banner deletion failed:', error)
                }
            }
            // Upload new banner
            try {
                banner_image = await uploadImageToCloudinary(data.new_banner_image)
            } catch (error) {
                console.error('New banner upload failed:', error)
            }
        }

        // Regenerate slug if location or year changed
        const newCountry = data.country || existingMeet.country
        const newState = data.state || existingMeet.state
        const newDistrict = data.district || existingMeet.district
        const newYear = data.year ? parseInt(data.year) : existingMeet.year
        
        const locationChanged = 
            newCountry !== existingMeet.country ||
            newState !== existingMeet.state ||
            newDistrict !== existingMeet.district ||
            newYear !== existingMeet.year
        
        let slug = existingMeet.slug
        if (locationChanged) {
            const baseSlug = generateSlug(newDistrict, newState, newCountry, newYear)
            slug = await ensureUniqueSlug(db, baseSlug, existingMeet._id)
        }

        const updateData = {
            slug,
            country: newCountry,
            state: newState,
            district: newDistrict,
            year: newYear,
            caption_en: data.caption_en !== undefined ? data.caption_en : existingMeet.caption_en,
            caption_ta: data.caption_ta !== undefined ? data.caption_ta : existingMeet.caption_ta,
            banner_image,
            updated_at: new Date(),
        }

        await collection.updateOne(query, { $set: updateData })

        return NextResponse.json({
            success: true,
            message: 'Friendship meet updated successfully',
        })
    } catch (error) {
        console.error('PUT friendship meet error:', error)
        return NextResponse.json({ success: false, error: 'Failed to update friendship meet' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const data = await request.json()

        if (!data.id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
        }

        const db = await getDb()
        const collection = db.collection('friendship_meets')

        // Support both ObjectId and slug for lookup
        let query: any
        try {
            query = { _id: new ObjectId(data.id) }
        } catch {
            query = { slug: data.id }
        }

        const meet = await collection.findOne(query)

        if (!meet) {
            return NextResponse.json({ success: false, error: 'Friendship meet not found' }, { status: 404 })
        }

        // Delete banner image from Cloudinary
        if (meet.banner_image?.public_id) {
            try {
                await deleteImageFromCloudinary(meet.banner_image.public_id)
            } catch (error) {
                console.error('Banner image deletion failed:', error)
            }
        }

        // Delete all associated gallery items
        const galleryCollection = db.collection('gallery_items')
        await galleryCollection.deleteMany({ meet_id: meet.slug || meet._id.toString() })

        await collection.deleteOne(query)

        return NextResponse.json({
            success: true,
            message: 'Friendship meet deleted successfully',
        })
    } catch (error) {
        console.error('DELETE friendship meet error:', error)
        return NextResponse.json({ success: false, error: 'Failed to delete friendship meet' }, { status: 500 })
    }
}
