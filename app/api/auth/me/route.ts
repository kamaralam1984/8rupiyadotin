import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { verifyToken } from "@/lib/utils/jwt";

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
    // Get token from cookie or Authorization header
    const cookieHeader = request.headers.get("cookie") || "";
    const authHeader = request.headers.get("authorization");
    
    let token: string | undefined;
    
    // Try to get from cookie first
    if (cookieHeader.includes("token=")) {
      token = cookieHeader.split("token=")[1]?.split(";")[0];
    }
    
    // If not in cookie, try Authorization header
    if (!token && authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const usersCollection = db.collection("users");

    // Get user from database
    const user = await usersCollection.findOne(
      { _id: new ObjectId(payload.userId) },
      { projection: { password: 0 } } // Exclude password
    );

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "User not found or inactive" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        agentCode: user.agentCode,
        operatorCode: user.operatorCode,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        error: "Failed to get user",
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

