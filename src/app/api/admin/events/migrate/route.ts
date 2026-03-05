import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAdminSession } from '@/lib/auth-edge'

// POST - Migrate existing news to events
export async function POST() {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const db = await getDb()
        
        // Get all news items
        const newsItems = await db.collection('news_events').find({}).toArray()
        
        // Get all existing events
        const existingEvents = await db.collection('events').find({}).toArray()
        const existingNewsIds = new Map(existingEvents.map(e => [e.newsId, e]))
        
        let created = 0
        let updated = 0
        let skipped = 0
        
        for (const news of newsItems) {
            const newsId = news._id.toString()
            const existingEvent = existingNewsIds.get(newsId)
            
            if (existingEvent) {
                // Update existing event with posterImage if it doesn't have one
                if (!existingEvent.posterImage && news.image_url) {
                    await db.collection('events').updateOne(
                        { _id: existingEvent._id },
                        { 
                            $set: { 
                                posterImage: news.image_url,
                                updatedAt: new Date()
                            } 
                        }
                    )
                    updated++
                } else {
                    skipped++
                }
            } else {
                // Create new event entry
                const eventDoc = {
                    newsId: newsId,
                    title_en: news.title_en || '',
                    title_ta: news.title_ta || '',
                    description_en: news.description_en || '',
                    description_ta: news.description_ta || '',
                    posterImage: news.image_url || '',
                    photos: [],
                    date: news.date,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
                
                await db.collection('events').insertOne(eventDoc)
                created++
            }
        }
        
        return NextResponse.json({
            success: true,
            message: `Sync complete! Created ${created} new events, updated ${updated} with posters, skipped ${skipped}.`,
            stats: { created, updated, skipped, total: newsItems.length }
        })
    } catch (error) {
        console.error('Events migration error:', error)
        return NextResponse.json({ success: false, error: 'Migration failed' }, { status: 500 })
    }
}
