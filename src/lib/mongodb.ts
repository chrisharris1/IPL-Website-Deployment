import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in .env.local')
}

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
    if (cached.client) {
        return cached.client
    }

    if (!cached.promise) {
        const options = {
            tls: true,
            tlsAllowInvalidCertificates: false,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }
        cached.promise = MongoClient.connect(MONGODB_URI, options)
    }

    cached.client = await cached.promise
    return cached.client
}

export async function getDb(): Promise<Db> {
    const client = await getMongoClient()
    return client.db() // Uses the database name from the connection string
}
