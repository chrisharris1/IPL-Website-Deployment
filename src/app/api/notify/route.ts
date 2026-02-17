
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { reminderSchema } from '@/lib/validation'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validation = reminderSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.format() },
                { status: 400 }
            )
        }

        const { email, eventId, eventTitle, eventDate, eventLocation } = validation.data
        const db = await getDb()
        const collection = db.collection('event_reminders')

        // Check if already subscribed
        const existing = await collection.findOne({ email, eventId })
        if (existing) {
            return NextResponse.json(
                { error: 'You are already subscribed to reminders for this event.' },
                { status: 409 }
            )
        }

        // Save subscription
        await collection.insertOne({
            email,
            eventId,
            eventTitle,
            eventDate: new Date(eventDate),
            eventLocation,
            remindersSent: { '24h': false, '6h': false },
            createdAt: new Date(),
        })

        // Send confirmation email
        const dateStr = new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        const timeStr = new Date(eventDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #d50032;">Reminder Set!</h2>
                <p>Hi there,</p>
                <p>You have successfully subscribed to reminders for the event: <strong>${eventTitle}</strong>.</p>
                <p><strong>Event Details:</strong><br>
                Date: ${dateStr}<br>
                Time: ${timeStr}<br>
                Location: ${eventLocation || 'See details online'}</p>
                <p>We will send you a reminder 1 day before and a few hours before the event starts.</p>
                <br>
                <p>For more updates on this event, contact:<br>
                <strong>President M.KARUN</strong><br>
                Phone: +91 98920 35187<br>
                Email: (Add Email Here)</p>
                <br>
                <p>Best regards,<br>M.KARUN, Founder President</p>
            </div>
        `

        const sent = await sendEmail(email, `Reminder Set: ${eventTitle}`, emailHtml)

        if (!sent) {
            return NextResponse.json({ error: 'Failed to send confirmation email. Please check server logs.' }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Reminder set successfully!' })

    } catch (error) {
        console.error('Error in notify route:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
