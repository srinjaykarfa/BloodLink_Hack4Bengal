import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/"
const DB_NAME = process.env.MONGO_DB_NAME || "VeinChain"

export async function GET(_request: NextRequest) {
  const client = new MongoClient(MONGO_URI)

  try {
    await client.connect()
    const db = client.db(DB_NAME)

    // Get all collections
    const collections = await db.listCollections().toArray()
    console.log(
      "Available collections:",
      collections.map((c) => c.name),
    )

    // Check different possible collection names
    const possibleCollections = ["users", "donors", "user", "donor", "people", "accounts"]
    const collectionData: Record<string, { exists: boolean; count?: number; sampleDocument?: any; error?: string }> = {}

    for (const collectionName of possibleCollections) {
      try {
        const collection = db.collection(collectionName)
        const count = await collection.countDocuments({})
        const sampleDoc = await collection.findOne({})

        collectionData[collectionName] = {
          exists: count > 0,
          count,
          sampleDocument: sampleDoc,
        }
      } catch (error) {
        collectionData[collectionName] = {
          exists: false,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    }

    // Also check what collections actually exist
    const actualCollections: Record<string, { count: number; sampleDocument: any }> = {}
    for (const collection of collections) {
      const coll = db.collection(collection.name)
      const count = await coll.countDocuments({})
      const sample = await coll.findOne({})

      actualCollections[collection.name] = {
        count,
        sampleDocument: sample,
      }
    }

    return NextResponse.json({
      databaseName: DB_NAME,
      mongoUri: MONGO_URI.replace(/\/\/.*@/, "//***:***@"), // Hide credentials
      availableCollections: collections.map((c) => c.name),
      possibleCollectionsCheck: collectionData,
      actualCollectionsData: actualCollections,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        databaseName: DB_NAME,
        mongoUri: MONGO_URI.replace(/\/\/.*@/, "//***:***@"),
      },
      { status: 500 },
    )
  } finally {
    await client.close()
  }
}
