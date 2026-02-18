
import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth-edge'
import { processReminders } from '@/lib/reminder-service'

export const dynamic = 'force-dynamic' // Ensure this route is not cached

export async function POST(request: NextRequest) {
    try {
        // 1. Verify Admin Session
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const processed = await processReminders()

        return NextResponse.json({
            success: true,
            processed
        })

    } catch (error) {
        console.error('Error in admin reminder route:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
