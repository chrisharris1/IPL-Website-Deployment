import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

const COUNTER_ID = 'site_visits'
const COLLECTION_NAME = 'site_counters'

export async function GET() {
  try {
    const db = await getDb()
    const counter = await db.collection(COLLECTION_NAME).findOne<{ count?: number }>({ _id: COUNTER_ID })

    return NextResponse.json({
      success: true,
      count: counter?.count ?? 0,
    })
  } catch (error) {
    console.error('Failed to read visit counter:', error)
    return NextResponse.json({ success: false, error: 'Failed to read visit counter' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const db = await getDb()
    const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
      { _id: COUNTER_ID },
      {
        $inc: { count: 1 },
        $set: { updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: 'after' }
    )

    return NextResponse.json({
      success: true,
      count: result?.count ?? 1,
    })
  } catch (error) {
    console.error('Failed to increment visit counter:', error)
    return NextResponse.json({ success: false, error: 'Failed to increment visit counter' }, { status: 500 })
  }
}