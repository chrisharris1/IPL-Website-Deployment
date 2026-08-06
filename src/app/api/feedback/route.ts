import { NextRequest, NextResponse } from 'next/server'
import { feedbackSchema } from '@/lib/validation'
import { sendEmail } from '@/lib/email'

const FEEDBACK_RECIPIENT_EMAIL = process.env.FEEDBACK_RECIPIENT_EMAIL || 'mkarun12354@gmail.com'

const escapeHtml = (value: string) => {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

const getCategoryLabel = (category: string | undefined): string => {
    const labels: Record<string, string> = {
        suggestion: 'Suggestion',
        issue: 'Website Issue',
        correction: 'Content Correction',
        other: 'Other',
    }
    return labels[category || 'other'] || 'Other'
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const parsed = feedbackSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const { name, email, category, message } = parsed.data

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; line-height: 1.6; color: #222;">
                <h2 style="color: #b91c1c; margin-bottom: 12px;">New Feedback Submission</h2>
                <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${escapeHtml(name)}${email ? ` (${escapeHtml(email)})` : ''}</p>
                <p style="margin: 0 0 10px 0;"><strong>Category:</strong> ${getCategoryLabel(category)}</p>
                <div style="margin-top: 12px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fafafa; white-space: pre-wrap;">${escapeHtml(message)}</div>
            </div>
        `

        const sent = await sendEmail(
            FEEDBACK_RECIPIENT_EMAIL,
            `[IPL Feedback] ${getCategoryLabel(category)}`,
            html
        )

        if (!sent) {
            return NextResponse.json(
                { error: 'Failed to send feedback. Please try again later.' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error in feedback route:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
