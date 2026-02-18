
import { getDb } from '@/lib/mongodb'
import { sendEmail } from '@/lib/email'

export async function processReminders() {
    const db = await getDb()
    const collection = db.collection('event_reminders')
    const now = new Date()

    let processed24h = 0
    let processed6h = 0

    // 1. Check for 24h reminders (Events starting between 23h and 25h from now)
    const start24 = new Date(now.getTime() + 23 * 60 * 60 * 1000)
    const end24 = new Date(now.getTime() + 25 * 60 * 60 * 1000)

    const reminders24 = await collection.find({
        eventDate: { $gte: start24, $lte: end24 },
        'remindersSent.24h': false
    }).toArray()

    for (const reminder of reminders24) {
        const dateStr = new Date(reminder.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        const timeStr = new Date(reminder.eventDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

        const html = `
            <div style="font-family: Arial, sans-serif;">
                <h2 style="color: #d50032;">Upcoming Event Reminder</h2>
                <p>This is a reminder that <strong>${reminder.eventTitle}</strong> is happening tomorrow!</p>
                <p><strong>When:</strong> ${dateStr} at ${timeStr}<br>
                <strong>Where:</strong> ${reminder.eventLocation || 'Online/Check details'}</p>
                <p>We look forward to seeing you there!</p>
                <br>
                <p>For more updates on this event, contact:<br>
                <strong>President M.KARUN</strong><br>
                Phone: +91 98920 35187<br>
                Email: (Add Email Here)</p>
                <br>
                <p>Best regards,<br>M.KARUN, Founder President</p>
            </div>
        `
        const sent = await sendEmail(reminder.email, `Tomorrow: ${reminder.eventTitle}`, html)
        if (sent) {
            await collection.updateOne({ _id: reminder._id }, { $set: { 'remindersSent.24h': true } })
            processed24h++
        }
    }

    // 2. Check for 6h reminders (Events starting between 5h and 9h from now)
    const start6 = new Date(now.getTime() + 5 * 60 * 60 * 1000)
    const end6 = new Date(now.getTime() + 9 * 60 * 60 * 1000)

    const reminders6 = await collection.find({
        eventDate: { $gte: start6, $lte: end6 },
        'remindersSent.6h': false
    }).toArray()

    for (const reminder of reminders6) {
        const timeStr = new Date(reminder.eventDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

        // Time difference in hours
        const diffMs = new Date(reminder.eventDate).getTime() - now.getTime()
        const diffHrs = Math.round(diffMs / (1000 * 60 * 60))

        const html = `
            <div style="font-family: Arial, sans-serif;">
                <h2 style="color: #d50032;">Happening Soon!</h2>
                <p><strong>${reminder.eventTitle}</strong> is starting in about ${diffHrs} hours.</p>
                <p><strong>Time:</strong> ${timeStr}<br>
                <strong>Where:</strong> ${reminder.eventLocation || 'Online/Check details'}</p>
                <p>See you soon!</p>
                <br>
                <p>For more updates on this event, contact:<br>
                <strong>President M.KARUN</strong><br>
                Phone: +91 98920 35187<br>
                Email: (Add Email Here)</p>
                <br>
                <p>Best regards,<br>M.KARUN, Founder President</p>
            </div>
        `
        const sent = await sendEmail(reminder.email, `Starting Soon: ${reminder.eventTitle}`, html)
        if (sent) {
            await collection.updateOne({ _id: reminder._id }, { $set: { 'remindersSent.6h': true } })
            processed6h++
        }
    }

    return {
        '24h': processed24h,
        '6h': processed6h
    }
}
