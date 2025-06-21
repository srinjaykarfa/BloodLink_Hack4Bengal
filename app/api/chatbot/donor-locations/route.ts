import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/"
const DB_NAME = "VeinChain"
const COLLECTION_NAME = "users"

export async function GET() {
  const client = new MongoClient(MONGO_URI)

  try {
    await client.connect()
    const db = client.db(DB_NAME)
    const collection = db.collection(COLLECTION_NAME)

    // Get unique cities and their counts
    const pipeline = [{ $group: { _id: "$city", count: { $sum: 1 } } }]
    const cityCounts = await collection.aggregate(pipeline).toArray()

    const results = []

    for (const item of cityCounts) {
      const city = item._id
      const count = item.count

      try {
        // Geocode city using Nominatim
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json`,
          {
            headers: { "User-Agent": "bloodbank-chatbot" },
          },
        )
        const locations = await response.json()

        if (locations && locations.length > 0) {
          results.push({
            city,
            lat: Number.parseFloat(locations[0].lat),
            lon: Number.parseFloat(locations[0].lon),
            count,
          })
        }
      } catch (error) {
        console.error(`Failed to geocode ${city}:`, error)
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fetching donor locations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await client.close()
  }
}
