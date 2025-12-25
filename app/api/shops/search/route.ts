import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Connect using MONGODB_URI_db1 from .env.local
const MONGODB_URI = process.env.MONGODB_URI_db1 || process.env.MONGODB_URI || "";
const DB_NAME = process.env.DB_NAME || "99-rupeess";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "";
  const pincode = searchParams.get("pincode") || "";
  const search = searchParams.get("search") || "";
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!MONGODB_URI) {
    console.warn("[API WARNING] MongoDB URI not configured - returning empty array");
    return NextResponse.json([]);
  }

  let client: MongoClient | null = null;

  try {
    console.log(`[API] Searching shops - category: ${category}, pincode: ${pincode}, search: ${search}`);
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const shopsCollection = db.collection("agentshops");

    // Build search filter - make paymentStatus optional
    const matchFilter: any = {
      $and: [
        {
          $or: [
            { paymentStatus: "PAID" },
            { paymentStatus: { $exists: false } },
            { paymentStatus: null },
          ],
        },
      ],
    };

    // Add search conditions
    if (category) {
      matchFilter.$and.push({
        category: { $regex: category, $options: "i" },
      });
    }

    if (pincode) {
      matchFilter.$and.push({
        pincode: pincode,
      });
    }

    if (search) {
      matchFilter.$and.push({
        $or: [
          { shopName: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
        ],
      });
    }

    // Find shops
    const shops = await shopsCollection
      .aggregate([
        {
          $match: matchFilter,
        },
        {
          $sort: { lastPaymentDate: -1 }, // Sort by latest payment
        },
        {
          $limit: limit,
        },
        {
          $project: {
            id: { $toString: "$_id" },
            name: "$shopName",
            category: 1,
            rating: { $ifNull: ["$rating", 4.5] },
            photoUrl: 1,
            shopUrl: 1,
            planType: 1,
            pincode: 1,
            address: 1,
            mobile: 1,
            visitorCount: { $ifNull: ["$visitorCount", 0] },
            _id: 0,
          },
        },
      ])
      .toArray();

    console.log(`[API] Found ${shops.length} shops matching search criteria`);
    return NextResponse.json(shops);
  } catch (error) {
    console.error("[API ERROR] Error searching shops:", error);
    console.error("[API ERROR] Returning empty array due to error");
    // Return empty array instead of error to prevent frontend issues
    return NextResponse.json([]);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

