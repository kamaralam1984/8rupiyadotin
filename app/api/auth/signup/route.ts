import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI_db1 || process.env.MONGODB_URI || "";
const DB_NAME = process.env.DB_NAME || "99-rupeess";

export async function POST(request: Request) {
  if (!MONGODB_URI) {
    return NextResponse.json(
      { error: "MongoDB not configured" },
      { status: 500 }
    );
  }

  let client: MongoClient | null = null;

  try {
    const body = await request.json();
    const { name, email, phone, password, role } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (!["admin", "agent", "operator", "user"].includes(role || "user")) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      $or: [{ email: email.toLowerCase() }, ...(phone ? [{ phone }] : [])],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or phone already exists" },
        { status: 400 }
      );
    }

    // Generate agent/operator code if needed
    let agentCode: string | undefined;
    let operatorCode: string | undefined;

    if (role === "agent") {
      const agentCount = await usersCollection.countDocuments({ role: "agent" });
      agentCode = `AG${String(agentCount + 1).padStart(4, "0")}`;
    }

    if (role === "operator") {
      const operatorCount = await usersCollection.countDocuments({ role: "operator" });
      operatorCode = `OP${String(operatorCount + 1).padStart(4, "0")}`;
    }

    // Create user
    const userData: any = {
      name,
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save hook if using Mongoose
      role: role || "user",
      isActive: true,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (phone) userData.phone = phone;
    if (agentCode) userData.agentCode = agentCode;
    if (operatorCode) userData.operatorCode = operatorCode;

    // Hash password using bcrypt
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(password, salt);

    const result = await usersCollection.insertOne(userData);

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: result.insertedId.toString(),
          name: userData.name,
          email: userData.email,
          role: userData.role,
          agentCode: userData.agentCode,
          operatorCode: userData.operatorCode,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        error: "Failed to create user",
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

