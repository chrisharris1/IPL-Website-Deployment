
import { NextRequest, NextResponse } from 'next/server'
import { processReminders } from '@/lib/reminder-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        // Silent processing - don't need to expose details to public
        // Just return processed count for debugging validation if needed found in logs
        const processed = await processReminders()

        // Log for debugging (visible in Vercel/Server logs)
        if (processed['24h'] > 0 || processed['6h'] > 0) {
            console.log(`[LazyCron] Processed pending reminders:`, processed)
        }

        return NextResponse.json({
            success: true,
            status: 'processed'
        })
    } catch (error) {
        console.error('Error in public reminder task:', error)
        // Return 200 even on error to prevent client-side errors in console
        return NextResponse.json({ success: false }, { status: 200 })
    }
}
