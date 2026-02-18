// Script to remove intro fields from Friends Day content in database
// Run with: node clear-friends-day-intro.js

const { MongoClient } = require('mongodb')

async function clearIntroFields() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ipl'
    const client = new MongoClient(uri)

    try {
        await client.connect()
        console.log('Connected to MongoDB')

        const db = client.db()
        const collection = db.collection('friends_day_content')

        // Remove intro fields from the document
        const result = await collection.updateOne(
            { id: 'main' },
            {
                $unset: {
                    intro_title_en: '',
                    intro_title_ta: '',
                    intro_content_en: '',
                    intro_content_ta: ''
                }
            }
        )

        console.log('✅ Intro fields removed from Friends Day content')
        console.log(`Modified ${result.modifiedCount} document(s)`)
    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await client.close()
    }
}

clearIntroFields()
