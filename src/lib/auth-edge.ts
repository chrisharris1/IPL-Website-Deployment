
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
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('admin_token')?.value
        if (!token) {
            console.log('Auth: No admin token found in cookies')
            return null
        }
        console.log('Auth: Admin token found, verifying...')
        const result = await verifyToken(token)
        if (result) {
            console.log('Auth: Token verified successfully')
        } else {
            console.log('Auth: Token verification failed')
        }
        return result
    } catch (error) {
        console.error('Auth: Error getting admin session:', error)
        return null
    }
}
