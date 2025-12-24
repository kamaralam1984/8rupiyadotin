import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Connect using MONGODB_URI_db1 from .env.local
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
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");
  const rail = searchParams.get("rail");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "lat and lng parameters are required" },
      { status: 400 }
    );
  }

  if (!MONGODB_URI) {
    return NextResponse.json([], { status: 200 });
  }

  let client: MongoClient | null = null;

  try {
    client = await getMongoClient();
    const db = client.db(DB_NAME);
    const shopsCollection = db.collection("agentshops");

    // Build match filter
    let matchFilter: any = {
      paymentStatus: "PAID",
      latitude: { $exists: true, $ne: null, $type: "number" },
      longitude: { $exists: true, $ne: null, $type: "number" },
      shopName: { $exists: true, $ne: null, $nin: [""] },
    };

    // Add planType filter for rails
    if (rail === "left") {
      matchFilter = {
        ...matchFilter,
        $or: [
          { planType: { $in: ["LEFT_BAR", "PREMIUM", "FEATURED"] } },
          { planType: { $exists: false } },
          { planType: null },
        ],
      };
    } else if (rail === "right") {
      matchFilter = {
        ...matchFilter,
        $or: [
          { planType: { $in: ["RIGHT_SIDE", "PREMIUM", "FEATURED"] } },
          { planType: { $exists: false } },
          { planType: null },
        ],
      };
    } else if (rail === "hero") {
      matchFilter = {
        ...matchFilter,
        planType: { $in: ["HERO", "PREMIUM", "FEATURED", "BASIC"] },
      };
    }

    // Find nearby shops using aggregation
    const shops = await shopsCollection
      .aggregate([
        {
          $addFields: {
            distance: {
              $multiply: [
                6371,
                {
                  $acos: {
                    $add: [
                      {
                        $multiply: [
                          { $sin: { $degreesToRadians: "$latitude" } },
                          { $sin: { $degreesToRadians: lat } },
                        ],
                      },
                      {
                        $multiply: [
                          { $cos: { $degreesToRadians: "$latitude" } },
                          { $cos: { $degreesToRadians: lat } },
                          {
                            $cos: {
                              $subtract: [
                                { $degreesToRadians: "$longitude" },
                                { $degreesToRadians: lng },
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
        {
          $match: {
            ...matchFilter,
            distance: { $lte: 50 },
          },
        },
        {
          $sort: { distance: 1 },
        },
        {
          $limit: rail === "hero" ? 5 : rail ? 2 : 100,
        },
        {
          $project: {
            id: { $toString: "$_id" },
            name: "$shopName",
            category: 1,
            rating: { $ifNull: ["$rating", 4.5] },
            distance: { $round: ["$distance", 2] },
            photoUrl: 1,
            shopUrl: 1,
            planType: 1,
            owner: "$ownerName",
            city: 1,
            pincode: 1,
            views: { $ifNull: ["$visitorCount", 0] },
            _id: 0,
          },
        },
      ])
      .toArray();

    // Add cache headers
    return NextResponse.json(shops, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching nearby shops:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch nearby shops",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
