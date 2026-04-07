import { NextRequest, NextResponse } from 'next/server'
import { contactMessageSchema } from '@/lib/validation'
import { sendEmail } from '@/lib/email'

const CONTACT_RECIPIENT_EMAIL = process.env.CONTACT_RECIPIENT_EMAIL || 'iplmumbai12395@gmail.com'

const escapeHtml = (value: string) => {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const parsed = contactMessageSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const { name, email, subject, message } = parsed.data

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; line-height: 1.6; color: #222;">
                <h2 style="color: #b91c1c; margin-bottom: 12px;">New Contact Form Submission</h2>
                <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
                <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
                <div style="margin-top: 12px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fafafa; white-space: pre-wrap;">${escapeHtml(message)}</div>
            </div>
        `

        const sent = await sendEmail(
            CONTACT_RECIPIENT_EMAIL,
            `[IPL Contact] ${subject}`,
            html
        )

        if (!sent) {
            return NextResponse.json(
                { error: 'Failed to send email. Please try again later.' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error in contact route:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
