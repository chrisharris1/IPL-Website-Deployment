import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid ID' },
                { status: 400 }
            )
        }

        const db = await getDb()

        const news = await db
            .collection('news_events')
            .findOne({ _id: new ObjectId(id) })

        if (!news) {
            return NextResponse.json(
                { success: false, error: 'News event not found' },
                { status: 404 }
            )
        }

        const photos = Array.isArray(news.photos)
            ? news.photos
                  .filter((photo) => photo && typeof photo.url === 'string' && photo.url.trim())
                  .map((photo) => ({
                      url: photo.url,
                      public_id: photo.public_id || '',
                      uploadedAt: photo.uploadedAt || '',
                  }))
            : []

        return NextResponse.json({
            success: true,
            data: {
                id: news._id.toString(),
                title_en: news.title_en,
                title_ta: news.title_ta,
                country: news.country,
                state: news.state,
                district: news.district,
                city: news.city,
                date: news.date,
                time: news.time,
                description_en: news.description_en,
                description_ta: news.description_ta,
                image_url: news.image_url,
                photos,
            },
        })
    } catch (error) {
        console.error('News detail error:', error)
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        )
    }
}
