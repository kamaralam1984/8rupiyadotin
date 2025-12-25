import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  const MONGODB_URI = process.env.MONGODB_URI_db1 || process.env.MONGODB_URI || "";
  const DB_NAME = process.env.DB_NAME || "99-rupeess";

  const health = {
    status: "ok",
    mongodb: {
      uri_configured: !!MONGODB_URI,
      db_name: DB_NAME,
      connected: false,
      shops_count: 0,
    },
    timestamp: new Date().toISOString(),
  };

  if (!MONGODB_URI) {
    return NextResponse.json({
      ...health,
      status: "warning",
      message: "MongoDB URI not configured",
    });
  }

  let client: MongoClient | null = null;

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    health.mongodb.connected = true;

    const db = client.db(DB_NAME);
    const shopsCollection = db.collection("agentshops");
    health.mongodb.shops_count = await shopsCollection.countDocuments({});

    return NextResponse.json({
      ...health,
      status: "ok",
      message: "All systems operational",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ...health,
        status: "error",
        message: "MongoDB connection failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

