import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAdminSession } from '@/lib/auth-edge'

// Role hierarchy mapping
const ROLE_HIERARCHY = [
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

function getRoleLevel(roleName: string): number {
    if (roleName === 'Board of Trustees') return 10
    const role = ROLE_HIERARCHY.find(r => r.name === roleName)
    return role ? role.level : 99
}
// POST - Migrate existing team members to add hierarchy levels
export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const db = await getDb()

        // Get all team members without hierarchy_level
        const membersToMigrate = await db.collection('our_team')
            .find({
                $or: [
                    { hierarchy_level: { $exists: false } },
                    { hierarchy_level: null }
                ]
            })
            .toArray()

        if (membersToMigrate.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No team members need migration',
                migrated_count: 0
            })
        }

        // Update all members with hierarchy levels
        const updates = []
        for (const member of membersToMigrate) {
            const hierarchyLevel = getRoleLevel(member.role)
            updates.push(
                db.collection('our_team').updateOne(
                    { _id: member._id },
                    {
                        $set: {
                            hierarchy_level: hierarchyLevel,
                            updated_at: new Date()
                        }
                    }
                )
            )
        }

        await Promise.all(updates)

        // Log the migration results
        const migrationLog = membersToMigrate.map(member => ({
            name: member.name,
            role: member.role,
            assigned_level: getRoleLevel(member.role)
        }))

        return NextResponse.json({
            success: true,
            message: `Successfully migrated ${membersToMigrate.length} team members`,
            migrated_count: membersToMigrate.length,
            migration_details: migrationLog
        })

    } catch (error) {
        console.error('Team migration error:', error)
        return NextResponse.json({
            success: false,
            error: 'Migration failed: ' + (error as Error).message
        }, { status: 500 })
    }
}



// GET - Check migration status
export async function GET(request: NextRequest) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const db = await getDb()

        const [totalMembers, migratedMembers, unmigrated] = await Promise.all([
            db.collection('our_team').countDocuments({}),
            db.collection('our_team').countDocuments({
                hierarchy_level: { $exists: true, $ne: null }
            }),
            db.collection('our_team').find({
                $or: [
                    { hierarchy_level: { $exists: false } },
                    { hierarchy_level: null }
                ]
            }).toArray()
        ])

        return NextResponse.json({
            success: true,
            total_members: totalMembers,
            migrated_members: migratedMembers,
            pending_migration: totalMembers - migratedMembers,
            migration_needed: (totalMembers - migratedMembers) > 0,
            unmigrated_members: unmigrated.map(m => ({
                name: m.name,
                role: m.role,
                needs_level: getRoleLevel(m.role)
            }))
        })

    } catch (error) {
        console.error('Migration status check error:', error)
        return NextResponse.json({
            success: false,
            error: 'Status check failed'
        }, { status: 500 })
    }
}
