import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAdminSession } from '@/lib/auth-edge'
import { roleSchema } from '@/lib/validation'

// Default roles to seed into the database on first access
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

// Helper: ensure roles collection exists with default data
async function ensureRolesSeeded() {
    const db = await getDb()
    const count = await db.collection('team_roles').countDocuments()
    if (count === 0) {
        await db.collection('team_roles').insertMany(
            DEFAULT_ROLES.map(r => ({ ...r, created_at: new Date() }))
        )
    }
    return db
}

/**
 * Recompact all role levels to be sequential (1, 2, 3, ...).
 * The role identified by `targetId` is placed at position `targetLevel`,
 * and all other roles are renumbered around it — no gaps, no duplicates.
 */
async function recompactRoles(db: any, targetId: string, targetLevel: number) {
    const allRoles = await db.collection('team_roles')
        .find({})
        .sort({ level: 1, name: 1 })
        .toArray()

    // Separate the target role from the rest
    const targetRole = allRoles.find((r: any) => r._id.toString() === targetId)
    const otherRoles = allRoles.filter((r: any) => r._id.toString() !== targetId)

    if (!targetRole) return

    // Clamp the desired position to valid range
    const clampedPos = Math.max(1, Math.min(targetLevel, otherRoles.length + 1))

    // Insert the target at the desired position (0-indexed)
    otherRoles.splice(clampedPos - 1, 0, targetRole)

    // Renumber all roles 1, 2, 3, ...
    const bulkOps: any[] = []
    for (let i = 0; i < otherRoles.length; i++) {
        const newLvl = i + 1
        if (otherRoles[i].level !== newLvl) {
            bulkOps.push({
                updateOne: {
                    filter: { _id: otherRoles[i]._id },
                    update: { $set: { level: newLvl } },
                },
            })
        }
    }

    if (bulkOps.length > 0) {
        await db.collection('team_roles').bulkWrite(bulkOps)
    }
}

/** Sync hierarchy_level on all team members to match current role levels */
async function syncMemberHierarchy(db: any) {
    const allRoles = await db.collection('team_roles').find({}).toArray()
    for (const r of allRoles) {
        await db.collection('our_team').updateMany(
            { role: r.name },
            { $set: { hierarchy_level: r.level } }
        )
    }
}

// GET - List all roles (sorted by level)
export async function GET() {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const db = await ensureRolesSeeded()
        const roles = await db
            .collection('team_roles')
            .find({})
            .sort({ level: 1, name: 1 })
            .toArray()

        const mapped = roles.map(r => ({
            id: r._id.toString(),
            name: r.name,
            level: r.level,
        }))

        return NextResponse.json({ success: true, data: mapped })
    } catch (error) {
        console.error('Admin Roles GET error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// POST - Add a new role (shifts existing roles to make room)
export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validation = roleSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.format() }, { status: 400 })
        }

        const { name, level, skipShift } = validation.data
        const db = await ensureRolesSeeded()

        // Check for duplicate name
        const existing = await db.collection('team_roles').findOne({ name: name.trim() })
        if (existing) {
            return NextResponse.json({ success: false, error: 'A role with this name already exists' }, { status: 400 })
        }

        // Insert the new role
        const doc = { name: name.trim(), level, created_at: new Date() }
        const result = await db.collection('team_roles').insertOne(doc)
        const newRoleId = result.insertedId.toString()

        // Recompact only if not grouping (skipShift = group mode)
        if (!skipShift) {
            await recompactRoles(db, newRoleId, level)
        }
        await syncMemberHierarchy(db)

        // Return final state
        const inserted = await db.collection('team_roles').findOne({ _id: result.insertedId })
        return NextResponse.json({
            success: true,
            data: { id: newRoleId, name: inserted?.name, level: inserted?.level },
        })
    } catch (error) {
        console.error('Admin Roles POST error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// PUT - Update an existing role (shifts other roles when level changes)
export async function PUT(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        // Zod validation for basic role fields, but we also need 'id'
        const validation = roleSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ success: false, error: 'Invalid input', details: validation.error.format() }, { status: 400 })
        }

        const { name, level, skipShift } = validation.data
        const { id } = body // Extract ID separately or extend schema

        if (!id) {
            return NextResponse.json({ success: false, error: 'Role ID is required' }, { status: 400 })
        }

        const db = await ensureRolesSeeded()

        const existing = await db.collection('team_roles').findOne({ _id: new ObjectId(id) })
        if (!existing) {
            return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 })
        }

        // Check that new name doesn't conflict with another role
        const duplicate = await db.collection('team_roles').findOne({
            name: name.trim(),
            _id: { $ne: new ObjectId(id) },
        })
        if (duplicate) {
            return NextResponse.json({ success: false, error: 'Another role with this name already exists' }, { status: 400 })
        }

        const oldName = existing.name as string
        const oldLevel = existing.level as number

        // Update the role's name and level first
        await db.collection('team_roles').updateOne(
            { _id: new ObjectId(id) },
            { $set: { name: name.trim(), level } }
        )

        // If the level changed AND this is not a drag-and-drop swap,
        // recompact all roles so no duplicates or gaps remain
        if (oldLevel !== level && !skipShift) {
            await recompactRoles(db, id, level)
        }

        // If the role name changed, update all team members who had the old name
        if (oldName !== name.trim()) {
            await db.collection('our_team').updateMany(
                { role: oldName },
                { $set: { role: name.trim() } }
            )
        }

        // Sync hierarchy_level for all members
        await syncMemberHierarchy(db)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin Roles PUT error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

// DELETE - Remove a role (only if no members are assigned, then recompact)
export async function DELETE(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await request.json()
        if (!id) {
            return NextResponse.json({ success: false, error: 'Role ID is required' }, { status: 400 })
        }

        const db = await ensureRolesSeeded()

        const role = await db.collection('team_roles').findOne({ _id: new ObjectId(id) })
        if (!role) {
            return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 })
        }

        // Check if any members are assigned to this role
        const memberCount = await db.collection('our_team').countDocuments({ role: role.name })
        if (memberCount > 0) {
            return NextResponse.json({
                success: false,
                error: `Cannot delete: ${memberCount} member(s) are assigned to "${role.name}". Remove or reassign them first.`,
            }, { status: 400 })
        }

        await db.collection('team_roles').deleteOne({ _id: new ObjectId(id) })

        // Recompact remaining roles to close gaps
        const remaining = await db.collection('team_roles')
            .find({})
            .sort({ level: 1, name: 1 })
            .toArray()

        const bulkOps: any[] = []
        for (let i = 0; i < remaining.length; i++) {
            const newLvl = i + 1
            if (remaining[i].level !== newLvl) {
                bulkOps.push({
                    updateOne: {
                        filter: { _id: remaining[i]._id },
                        update: { $set: { level: newLvl } },
                    },
                })
            }
        }
        if (bulkOps.length > 0) {
            await db.collection('team_roles').bulkWrite(bulkOps)
        }

        // Sync member hierarchy
        await syncMemberHierarchy(db)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin Roles DELETE error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
