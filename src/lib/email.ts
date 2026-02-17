
import nodemailer from 'nodemailer'

const email = process.env.NODEMAILER_EMAIL
const pass = process.env.NODEMAILER_PASSWORD

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: email,
        pass: pass,
    },
})

export const sendEmail = async (to: string, subject: string, html: string) => {
    if (!email || !pass) {
        console.warn('NODEMAILER_EMAIL or NODEMAILER_PASSWORD not set. Email not sent.')
        return false
    }

    try {
        await transporter.sendMail({
            from: `"M.KARUN, Founder President" <${email}>`,
            to,
            subject,
            html,
        })
        return true
    } catch (error) {
        console.error('Error sending email:', error)
        return false
    }
}
