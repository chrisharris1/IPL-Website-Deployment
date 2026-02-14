
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-me-in-prod'
const key = new TextEncoder().encode(JWT_SECRET)

export async function signToken(payload: any): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('4h') // 4 hours expiration
        .sign(key)
}

export async function verifyToken(token: string): Promise<any | null> {
    try {
        const { payload } = await jwtVerify(token, key)
        return payload
    } catch (error) {
        return null
    }
}

export async function getAdminSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token) return null
    return verifyToken(token)
}
