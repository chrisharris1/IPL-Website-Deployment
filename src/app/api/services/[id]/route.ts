import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        
        console.log('Fetching service with ID:', id)

        if (!id || !ObjectId.isValid(id)) {
            console.log('Invalid ID:', id)
            return NextResponse.json(
                { success: false, error: 'Invalid ID' },
                { status: 400 }
            )
        }

        const db = await getDb()
        const service = await db
            .collection('humanitarian_services')
            .findOne({ _id: new ObjectId(id) })
        
        console.log('Service found:', !!service)

        if (!service) {
            return NextResponse.json(
                { success: false, error: 'Service not found' },
                { status: 404 }
            )
        }

        const mapped = {
            id: service._id.toString(),
            title_en: service.title_en,
            title_ta: service.title_ta,
            country: service.country,
            state: service.state,
            district: service.district,
            city: service.city,
            date: service.date,
            description_en: service.description_en,
            description_ta: service.description_ta,
            image_url: service.image_url,
        }

        return NextResponse.json({ success: true, data: mapped })
    } catch (error) {
        console.error('Service detail error:', error)
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        )
    }
}
