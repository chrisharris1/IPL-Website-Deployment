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
        const base64 = `data:image/webp;base64,${fileBuffer.toString('base64')}`
        const result = await cloudinary.uploader.upload(base64, {
            folder,
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
