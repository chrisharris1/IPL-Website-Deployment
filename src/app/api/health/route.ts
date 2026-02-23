import { NextResponse } from 'next/server'

export async function GET() {
    const envCheck = {
        MONGODB_URI: !!process.env.MONGODB_URI,
        JWT_SECRET: !!process.env.JWT_SECRET,
        CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
        NODEMAILER_EMAIL: !!process.env.NODEMAILER_EMAIL,
        NODEMAILER_PASSWORD: !!process.env.NODEMAILER_PASSWORD,
    }

    return NextResponse.json({
        status: 'ok',
        environment: process.env.NODE_ENV,
        envVariables: envCheck,
        allSet: Object.values(envCheck).every(v => v === true),
    })
}
