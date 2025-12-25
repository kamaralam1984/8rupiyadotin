import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Connect using MONGODB_URI_db1 from .env.local
const MONGODB_URI = process.env.MONGODB_URI_db1 || process.env.MONGODB_URI || "";
const DB_NAME = process.env.DB_NAME || "99-rupeess";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");
  const rail = searchParams.get("rail"); // "left" or "right" for rail-specific shops

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "lat and lng parameters are required" },
      { status: 400 }
    );
  }

  if (!MONGODB_URI) {
    // Fallback: Return sample data if MongoDB is not configured
    return NextResponse.json([
      {
        id: "1",
        name: "Quick Mart",
        category: "Grocery",
        rating: 4.5,
        distance: 0.3,
        photoUrl: "/next.svg",
      },
      {
        id: "2",
        name: "Beauty Salon Elite",
        category: "Beauty",
        rating: 4.6,
        distance: 0.7,
        photoUrl: "/next.svg",
      },
    ]);
  }

  let client: MongoClient | null = null;

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const shopsCollection = db.collection("agentshops");

    // Ensure geospatial index exists on latitude/longitude
    try {
      await shopsCollection.createIndex({ latitude: 1, longitude: 1 });
    } catch (error) {
      // Index might already exist, ignore
    }

    // Build match filter
    let matchFilter: any = {
      paymentStatus: "PAID",
      latitude: { $exists: true, $ne: null, $type: "number" },
      longitude: { $exists: true, $ne: null, $type: "number" },
      shopName: { $exists: true, $ne: null, $nin: [""] },
    };

    // Add planType filter for rails (but make it optional if no shops found)
    if (rail === "left") {
      matchFilter = {
        ...matchFilter,
        $or: [
          { planType: { $in: ["LEFT_BAR", "PREMIUM", "FEATURED"] } },
          { planType: { $exists: false } }, // Include shops without planType
          { planType: null }, // Include shops with null planType
        ],
      };
    } else if (rail === "right") {
      matchFilter = {
        ...matchFilter,
        $or: [
          { planType: { $in: ["RIGHT_SIDE", "PREMIUM", "FEATURED"] } },
          { planType: { $exists: false } }, // Include shops without planType
          { planType: null }, // Include shops with null planType
        ],
      };
    } else if (rail === "hero") {
      matchFilter = {
        ...matchFilter,
        planType: { $in: ["HERO", "PREMIUM", "FEATURED", "BASIC"] },
      };
    }

    // Find nearby shops using latitude/longitude fields
    // Using aggregation with distance calculation
    const shops = await shopsCollection
      .aggregate([
        {
          $addFields: {
            distance: {
              $multiply: [
                6371, // Earth radius in km
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
            distance: { $lte: 50 }, // Within 50km (increased for testing)
          },
        },
        {
          $sort: { distance: 1 }, // Sort by distance
        },
        {
          $limit: rail === "hero" ? 5 : rail ? 2 : 100, // Limit to 5 for hero, 2 for rails, 100 for general/shop-directory
        },
        {
          $project: {
            id: { $toString: "$_id" },
            name: "$shopName",
            category: 1,
            rating: { $ifNull: ["$rating", 4.5] }, // Default rating if not present
            distance: { $round: ["$distance", 2] }, // Round to 2 decimal places
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

    console.log(`Found ${shops.length} shops for rail: ${rail || "general"}`);
    return NextResponse.json(shops);
  } catch (error) {
    console.error("Error fetching nearby shops:", error);
    console.error("MongoDB URI:", MONGODB_URI ? "Set" : "Not set");
    console.error("DB Name:", DB_NAME);
    return NextResponse.json(
      { 
        error: "Failed to fetch nearby shops",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

