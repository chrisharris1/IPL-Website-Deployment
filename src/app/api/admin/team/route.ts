import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { uploadImage, deleteImage } from '@/lib/cloudinary'
import { ObjectId } from 'mongodb'
import { getAdminSession } from '@/lib/auth-edge'

// Default roles to seed if team_roles collection is empty
const DEFAULT_ROLES = [
    { name: 'President', level: 1 },
    { name: 'General Secretary', level: 2 },
    { name: 'Treasurer', level: 3 },
    { name: 'Vice President', level: 4 },
    { name: 'Joint Secretary', level: 5 },
    { name: 'Committee Member', level: 6 },
    { name: 'Coordinator', level: 7 },
    { name: 'Organiser', level: 8 },
    { name: 'Overseas Organiser', level: 9 },
    { name: 'Board of Trustee', level: 10 },
]

async function getRolesFromDb(): Promise<{ name: string; level: number }[]> {
    const db = await getDb()
    const count = await db.collection('team_roles').countDocuments()
    if (count === 0) {
        await db.collection('team_roles').insertMany(
            DEFAULT_ROLES.map(r => ({ ...r, created_at: new Date() }))
        )
    }
    const docs = await db.collection('team_roles').find({}).sort({ level: 1, name: 1 }).toArray()
    return docs.map(d => ({ name: d.name as string, level: d.level as number }))
}

function getRoleLevel(roleName: string, roles: { name: string; level: number }[]): number {
    if (roleName === 'Board of Trustees') {
        const trustee = roles.find(r => r.name === 'Board of Trustee')
        if (trustee) return trustee.level
    }
    const role = roles.find(r => r.name === roleName)
    return role ? role.level : 99 // Unknown roles get highest number (lowest priority)
}

// GET - List all team members
export async function GET() {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const db = await getDb()
        const roles = await getRolesFromDb()
        const members = await db
            .collection('our_team')
            .find({})
            .sort({ hierarchy_level: 1, order_index: 1 })
            .toArray()

        const mapped = members.map((m) => ({
            id: m._id.toString(),
            name: m.name,
            role: m.role,
            hierarchy_level: m.hierarchy_level || getRoleLevel(m.role, roles),
            image_url: m.image_url,
            order_index: m.order_index,
            email: m.email || '',
            phone: m.phone || '',
            location: m.location || '',
        }))

        return NextResponse.json({ success: true, data: mapped })
    } catch (error) {
        console.error('Admin Team GET error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// POST - Add new team member
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

        // Basic validation
        const name = formData.get('name') as string
        const role = formData.get('role') as string
        if (!name || !role) {
            return NextResponse.json({ success: false, error: 'Name and Role are required' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const uploadResult = await uploadImage(buffer, 'team')

        if (!uploadResult.success || !uploadResult.url) {
            return NextResponse.json(
                { success: false, error: uploadResult.error || 'Upload failed' },
                { status: 500 }
            )
        }

        const roles = await getRolesFromDb()
        const hierarchyLevel = getRoleLevel(role, roles)
        const db = await getDb()

        // Get next order index for this hierarchy level
        const last = await db.collection('our_team')
            .find({ hierarchy_level: hierarchyLevel })
            .sort({ order_index: -1 })
            .limit(1)
            .toArray()
        const nextOrder = last.length > 0 ? (last[0].order_index || 0) + 1 : 0

        const doc = {
            name: name,
            role,
            hierarchy_level: hierarchyLevel,
            image_url: uploadResult.url,
            order_index: nextOrder,
            email: ((formData.get('email') as string) || '').trim(),
            phone: ((formData.get('phone') as string) || '').trim(),
            location: ((formData.get('location') as string) || '').trim(),
            created_at: new Date(),
        }

        const result = await db.collection('our_team').insertOne(doc)

        return NextResponse.json({
            success: true,
            data: { id: result.insertedId.toString(), ...doc },
        })
    } catch (error) {
        console.error('Admin Team POST error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// PUT - Update team member or reorder
export async function PUT(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const contentType = request.headers.get('content-type') || ''

        // Handle reorder (JSON body with orderedIds)
        if (contentType.includes('application/json')) {
            const body = await request.json()
            if (body.orderedIds && Array.isArray(body.orderedIds)) {
                const db = await getDb()
                const updates = body.orderedIds.map((id: string, index: number) =>
                    db.collection('our_team').updateOne(
                        { _id: new ObjectId(id) },
                        { $set: { order_index: index } }
                    )
                )
                await Promise.all(updates)
                return NextResponse.json({ success: true })
            }
        }

        // Handle edit (FormData)
        const formData = await request.formData()
        const id = formData.get('id') as string

        if (!id) {
            return NextResponse.json({ success: false, error: 'No ID provided' }, { status: 400 })
        }

        const db = await getDb()
        const existing = await db.collection('our_team').findOne({ _id: new ObjectId(id) })
        if (!existing) {
            return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
        }

        const name = formData.get('name') as string
        const role = formData.get('role') as string

        if (!name || !role) {
            return NextResponse.json({ success: false, error: 'Name and Role are required' }, { status: 400 })
        }

        const update: Record<string, unknown> = {
            name,
            role,
            email: ((formData.get('email') as string) || '').trim(),
            phone: ((formData.get('phone') as string) || '').trim(),
            location: ((formData.get('location') as string) || '').trim(),
        }

        // Update hierarchy level based on new role
        const roles = await getRolesFromDb()
        update.hierarchy_level = getRoleLevel(role, roles)

        const file = formData.get('image') as File | null
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const uploadResult = await uploadImage(buffer, 'team')
            if (uploadResult.success && uploadResult.url) {
                await deleteImage(existing.image_url)
                update.image_url = uploadResult.url
            }
        }

        await db.collection('our_team').updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin Team PUT error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// DELETE - Remove team member
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
        const doc = await db.collection('our_team').findOne({ _id: new ObjectId(id) })

        if (doc) {
            await deleteImage(doc.image_url)
            await db.collection('our_team').deleteOne({ _id: new ObjectId(id) })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin Team DELETE error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
