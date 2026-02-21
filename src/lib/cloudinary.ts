import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

/**
 * Upload a base64 or buffer image to Cloudinary
 */
export async function uploadImage(
    fileBuffer: Buffer,
    folder: string = 'carousel'
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Detect image type from buffer signature
        let mimeType = 'image/jpeg' // default
        const signature = fileBuffer.toString('hex', 0, 4)
        
        if (signature.startsWith('89504e47')) {
            mimeType = 'image/png'
        } else if (signature.startsWith('47494638')) {
            mimeType = 'image/gif'
        } else if (signature.startsWith('52494646') && fileBuffer.toString('hex', 8, 12) === '57454250') {
            mimeType = 'image/webp'
        } else if (signature.startsWith('ffd8ff')) {
            mimeType = 'image/jpeg'
        }

        const base64 = `data:${mimeType};base64,${fileBuffer.toString('base64')}`
        const result = await cloudinary.uploader.upload(base64, {
            folder: `ipl/${folder}`,
            resource_type: 'image',
        })
        return { success: true, url: result.secure_url }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed'
        return { success: false, error: message }
    }
}

/**
 * Delete an image from Cloudinary by URL
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
    try {
        // Extract public_id from URL
        const match = imageUrl.match(/\/v\d+\/(.+)\.\w+$/)
        if (!match) return false

        const publicId = match[1]
        await cloudinary.uploader.destroy(publicId)
        return true
    } catch {
        return false
    }
}
