
import { z } from 'zod'

export const loginSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
})

export const roleSchema = z.object({
    name: z.string().min(1),
    level: z.number().min(1),
    skipShift: z.boolean().optional(),
})

export const teamMemberSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    roleId: z.string().min(1),
    image: z.string().optional(), // Base64 or URL
    bio: z.string().optional(),
    order: z.number().optional(),
})

export const imageUploadSchema = z.object({
    file: z.instanceof(Blob, { message: "Image is required" })
        .refine((file) => file.size <= 5 * 1024 * 1024, "Max file size is 5MB")
        .refine(
            (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
            "Only .jpg, .png, and .webp formats are supported"
        ),
})

export const newsSchema = z.object({
    title_en: z.string().min(1),
    title_ta: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    description_en: z.string().optional(),
    description_ta: z.string().optional(),
    id: z.string().optional(),
})

export const serviceSchema = z.object({
    title_en: z.string().min(1),
    title_ta: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    date: z.string().optional(),
    description_en: z.string().optional(),
    description_ta: z.string().optional(),
    id: z.string().optional(),
})


export const carouselSchema = z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    hide_text: z.boolean().optional(),
    active: z.boolean().optional(),
    id: z.string().optional(),
})

export const aboutSchema = z.object({
    section_title_en: z.string().optional(),
    section_title_ta: z.string().optional(),
    content_en: z.string().min(1),
    content_ta: z.string().optional(),
    order_index: z.number().optional(),
    id: z.string().optional(),
})

export const historySchema = aboutSchema

export const presidentBlogSchema = z.object({
    title_en: z.string().optional(),
    title_ta: z.string().optional(),
    description_en: z.string().optional(),
    description_ta: z.string().optional(),
    id: z.string().optional(),
})

export const friendshipLocationSchema = z.object({
    country: z.string().min(1),
    state: z.string().min(1),
    district: z.string().min(1),
    year: z.coerce.number().min(1900),
    id: z.string().optional(),
})


export const friendshipEventSchema = z.object({
    location_id: z.string().min(1),
    details_en: z.string().optional(),
    details_ta: z.string().optional(),
    id: z.string().optional(),
})

export const customLocationSchema = z.object({
    type: z.enum(['country', 'state', 'district', 'city']),
    name: z.string().min(1),
    parent: z.object({
        country: z.string().optional(),
        state: z.string().optional(),
        district: z.string().optional(),
    }).optional(),
    added_by: z.string().optional(),
})

export const friendsDaySchema = z.object({
    intro_title_en: z.string().min(1, "Intro title (English) is required"),
    intro_title_ta: z.string().optional(),
    intro_content_en: z.string().min(1, "Intro content (English) is required"),
    intro_content_ta: z.string().optional(),
    about_title_en: z.string().optional(),
    about_title_ta: z.string().optional(),
    about_content_en: z.string().optional(),
    about_content_ta: z.string().optional(),
    id: z.string().optional(),
})

export const reminderSchema = z.object({
    email: z.string().email("Invalid email address"),
    eventId: z.string().min(1, "Event ID is required"),
    eventTitle: z.string().min(1, "Event title is required"),
    eventDate: z.string().min(1, "Event date is required"), // Keeping as string to matching API payload, will parse in route
    eventLocation: z.string().optional(),
})
