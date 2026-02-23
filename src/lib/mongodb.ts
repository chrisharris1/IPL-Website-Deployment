import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || ''

interface MongoClientCache {
    client: MongoClient | null
    promise: Promise<MongoClient> | null
}

// Use global variable to preserve connection across hot reloads in development
const globalWithMongo = globalThis as typeof globalThis & {
    _mongoClientPromise: MongoClientCache
}

if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = { client: null, promise: null }
}

const cached = globalWithMongo._mongoClientPromise

export async function getMongoClient(): Promise<MongoClient> {
    if (!MONGODB_URI) {
        console.error('MongoDB connection error: MONGODB_URI environment variable is not defined')
        throw new Error('Please define the MONGODB_URI environment variable in .env.local')
    }

    if (cached.client) {
        return cached.client
    }

    if (!cached.promise) {
        console.log('MongoDB: Establishing new connection...')
        const options = {
            tls: true,
            tlsAllowInvalidCertificates: false,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }
        try {
            cached.promise = MongoClient.connect(MONGODB_URI, options)
        } catch (error) {
            console.error('MongoDB connection error:', error)
            throw error
        }
    }

    try {
        cached.client = await cached.promise
        console.log('MongoDB: Connection established successfully')
        return cached.client
    } catch (error) {
        console.error('MongoDB: Failed to establish connection:', error)
        cached.promise = null // Reset promise so it can retry
        throw error
    }
}

export async function getDb(): Promise<Db> {
    const client = await getMongoClient()
    return client.db() // Uses the database name from the connection string
}
