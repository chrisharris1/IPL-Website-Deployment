import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAdminSession } from '@/lib/auth-edge'
import { customLocationSchema } from '@/lib/validation'

// GET: Fetch custom locations based on type and optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // country, state, district, city
    const country = searchParams.get('country')
    const state = searchParams.get('state')
    const district = searchParams.get('district')

    const db = await getDb()
    const collection = db.collection('custom_locations')

    // Build query
    let query: any = {}

    if (type) {
      query.type = type
    }

    // Add parent filters based on type
    if (country) {
      query['parent.country'] = country
    }

    if (state) {
      query['parent.state'] = state
    }

    if (district) {
      query['parent.district'] = district
    }

    const locations = await collection
      .find(query)
      .sort({ name: 1 })
      .toArray()

    // Transform to simple name array for frontend
    const names = locations.map(loc => loc.name)

    return NextResponse.json({
      success: true,
      locations: names,
      count: names.length
    })
  } catch (error) {
    console.error('Error fetching custom locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch custom locations' },
      { status: 500 }
    )
  }
}

// POST: Add a new custom location
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = customLocationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { type, name, parent = {}, added_by } = validation.data

    const db = await getDb()
    const collection = db.collection('custom_locations')

    // Check if location already exists
    const existingQuery: any = { type, name }

    // Add parent checks for uniqueness
    if (type === 'state' && parent.country) {
      existingQuery['parent.country'] = parent.country
    }
    if (type === 'district' && parent.state) {
      existingQuery['parent.state'] = parent.state
    }
    if (type === 'city' && parent.district) {
      existingQuery['parent.district'] = parent.district
    }

    const existing = await collection.findOne(existingQuery)

    if (existing) {
      return NextResponse.json(
        { error: 'Location already exists', name: existing.name },
        { status: 409 }
      )
    }

    // Create new location document
    const newLocation: any = {
      type,
      name: name.trim(),
      parent: {
        country: parent.country,
        state: parent.state,
        district: parent.district,
      },
      added_by: added_by || session.username,
      created_at: new Date(),
      updated_at: new Date(),
    }

    // Remove undefined values from parent
    Object.keys(newLocation.parent).forEach(key =>
      newLocation.parent[key] === undefined && delete newLocation.parent[key]
    )

    const result = await collection.insertOne(newLocation)

    return NextResponse.json({
      success: true,
      message: 'Custom location added successfully',
      id: result.insertedId,
      location: newLocation,
    })
  } catch (error) {
    console.error('Error adding custom location:', error)
    return NextResponse.json(
      { error: 'Failed to add custom location' },
      { status: 500 }
    )
  }
}

// DELETE: Remove a custom location by name and type
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const name = searchParams.get('name')

    if (!type || !name) {
      return NextResponse.json(
        { error: 'Type and name are required' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const collection = db.collection('custom_locations')

    const result = await collection.deleteOne({ type, name })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Custom location deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting custom location:', error)
    return NextResponse.json(
      { error: 'Failed to delete custom location' },
      { status: 500 }
    )
  }
}
