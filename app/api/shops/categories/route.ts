import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Connect using MONGODB_URI_db1 from .env.local
const MONGODB_URI = process.env.MONGODB_URI_db1 || process.env.MONGODB_URI || "";
const DB_NAME = process.env.DB_NAME || "99-rupeess";

export async function GET(request: Request) {
  if (!MONGODB_URI) {
    return NextResponse.json(
      { error: "MongoDB not configured" },
      { status: 500 }
    );
  }

  let client: MongoClient | null = null;

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const shopsCollection = db.collection("agentshops");

    // Get distinct categories from paid shops
    const categories = await shopsCollection
      .distinct("category", {
        paymentStatus: "PAID",
        category: { $exists: true, $ne: null, $nin: [""] },
      });

    // Sort categories alphabetically
    const sortedCategories = categories.sort();

    return NextResponse.json(sortedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

