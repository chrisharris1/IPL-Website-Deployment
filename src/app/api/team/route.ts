import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

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
    return role ? role.level : 99
}

export async function GET() {
    try {
        const db = await getDb()
        // eslint-disable-next-line prefer-const
        let roles = await getRolesFromDb()

        // Manual override: Ensure "Founder, President" exists with Level 1
        if (!roles.find(r => r.name === 'Founder, President')) {
            roles.push({ name: 'Founder, President', level: 1 })
        }

        // Get all team members and organize by hierarchy
        const allMembers = await db
            .collection('our_team')
            .find({})
            .sort({ hierarchy_level: 1, order_index: 1 })
            .toArray()

        const mapMember = (m: Record<string, unknown>) => ({
            id: String(m._id),
            name: m.name,
            role: (m.name as string).includes('Karun') && m.role === 'President' ? 'Founder, President' : m.role,
            hierarchy_level: m.hierarchy_level || getRoleLevel(m.role as string, roles),
            image_url: m.image_url,
            order_index: m.order_index,
            email: m.email || '',
            phone: m.phone || '',
            location: m.location || '',
        })

        // Organize members by role name
        const organizedByHierarchy = allMembers.reduce((acc, member) => {
            const roleName = member.role as string
            if (!acc[roleName]) {
                acc[roleName] = []
            }
            acc[roleName].push(mapMember(member))
            return acc
        }, {} as Record<string, any[]>)

        // Group roles by level (same power number = grouped together)
        const levelGroups = new Map<number, { level: number; roleNames: string[]; members: any[] }>()
        for (const role of roles) {
            const members = organizedByHierarchy[role.name] || []
            if (members.length === 0) continue

            if (!levelGroups.has(role.level)) {
                levelGroups.set(role.level, { level: role.level, roleNames: [], members: [] })
            }
            const group = levelGroups.get(role.level)!
            group.roleNames.push(role.name)
            group.members.push(...members)
        }

        // Build membersByLevel from grouped roles
        const membersByLevel = Array.from(levelGroups.values())
            .filter(group => group.members.length > 0)
            .map(group => ({
                level: group.level,
                roleName: group.roleNames.join(' / '),
                members: group.members,
            }))

        return NextResponse.json({
            success: true,
            data: {
                // Legacy structure for backward compatibility
                presidents: organizedByHierarchy['President'] || [],
                trustees: [
                    ...(organizedByHierarchy['Board of Trustee'] || []),
                    ...(organizedByHierarchy['Board of Trustees'] || []),
                ],

                // New hierarchical structure
                hierarchy: organizedByHierarchy,

                // Role definitions for frontend reference
                roleHierarchy: roles,

                // All members organized by hierarchy level (same-level roles grouped)
                membersByLevel,
            },
        })
    } catch (error) {
        console.error('Team API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Database error' },
            { status: 500 }
        )
    }
}
