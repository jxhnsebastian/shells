import { NextResponse } from "next/server";
import User from "@/models/User";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/database";

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to MongoDB using your client
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Create user using Mongoose model (which handles password hashing)
    const user = new User({
      username,
      email,
      password,
      createdAt: new Date(),
    });

    await user.save();

    return NextResponse.json(
      {
        success: true,
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
