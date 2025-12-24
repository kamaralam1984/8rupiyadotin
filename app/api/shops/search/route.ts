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

    // Build search filter
    const matchFilter: any = {
      paymentStatus: "PAID",
    };

    // Add search conditions
    if (category) {
      matchFilter.category = { $regex: category, $options: "i" };
    }

    if (pincode) {
      matchFilter.pincode = pincode;
    }

    if (search) {
      matchFilter.$or = [
        { shopName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
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

    return NextResponse.json(shops);
  } catch (error) {
    console.error("Error searching shops:", error);
    return NextResponse.json(
      {
        error: "Failed to search shops",
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

