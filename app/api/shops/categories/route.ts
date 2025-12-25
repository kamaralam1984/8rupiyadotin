import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Connect using MONGODB_URI_db1 from .env.local
const MONGODB_URI = process.env.MONGODB_URI_db1 || process.env.MONGODB_URI || "";
const DB_NAME = process.env.DB_NAME || "99-rupeess";

export async function GET(request: Request) {
  // Fallback categories if MongoDB is not configured
  const fallbackCategories = [
    "Restaurant",
    "Hotels",
    "Electronics",
    "Fashion",
    "Wellness",
    "Cafe",
    "Fitness",
    "Beauty",
    "Healthcare",
    "Education",
    "Automotive",
    "Grocery",
    "Shopping",
    "AC Repair",
    "Plumber",
    "Electrician",
  ];

  if (!MONGODB_URI) {
    console.warn("[API WARNING] MongoDB URI not configured - returning fallback categories");
    return NextResponse.json(fallbackCategories);
  }

  let client: MongoClient | null = null;

  try {
    console.log("[API] Fetching categories from MongoDB");
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const shopsCollection = db.collection("agentshops");

    // Get distinct categories - make paymentStatus optional
    const categories = await shopsCollection.distinct("category", {
      $or: [
        { paymentStatus: "PAID" },
        { paymentStatus: { $exists: false } },
        { paymentStatus: null },
      ],
      category: { $exists: true, $ne: null, $nin: [""] },
    });

    // Sort categories alphabetically
    const sortedCategories = categories.sort();

    console.log(`[API] Found ${sortedCategories.length} categories`);
    
    // If no categories found, return fallback
    if (sortedCategories.length === 0) {
      console.warn("[API WARNING] No categories found in database - returning fallback");
      return NextResponse.json(fallbackCategories);
    }

    return NextResponse.json(sortedCategories);
  } catch (error) {
    console.error("[API ERROR] Error fetching categories:", error);
    console.error("[API ERROR] Returning fallback categories due to error");
    // Return fallback categories instead of error
    return NextResponse.json(fallbackCategories);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

