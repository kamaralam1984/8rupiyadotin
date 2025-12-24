import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI_db1 || process.env.MONGODB_URI || "";
const DB_NAME = process.env.DB_NAME || "99-rupeess";

// Cache connection
let cachedClient: MongoClient | null = null;

async function getMongoClient() {
  if (cachedClient) {
    return cachedClient;
  }
  cachedClient = new MongoClient(MONGODB_URI);
  await cachedClient.connect();
  return cachedClient;
}

export async function GET(request: Request) {
  if (!MONGODB_URI) {
    return NextResponse.json(
      { error: "MongoDB not configured" },
      { status: 500 }
    );
  }

  let client: MongoClient | null = null;

  try {
    client = await getMongoClient();
    const db = client.db(DB_NAME);
    const shopsCollection = db.collection("agentshops");

    // Get distinct categories from paid shops
    const categories = await shopsCollection.distinct("category", {
      paymentStatus: "PAID",
      category: { $exists: true, $ne: null, $nin: [""] },
    });

    // Sort categories alphabetically
    const sortedCategories = categories.sort();

    return NextResponse.json(sortedCategories, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
