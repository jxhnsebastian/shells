import { NextRequest, NextResponse } from "next/server";
import Watchlist from "@/models/Watchlist";
import connectToDatabase from "@/lib/database";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { movieId, movieDetails } = await request.json();

    if (!movieId) {
      return NextResponse.json(
        { error: "Movie ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get userId from session
    const userId = (session.user as any).id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }

    // Check if movie is already in watchlist
    const existingEntry = await Watchlist.findOne({
      userId,
      movieId,
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: "Movie already in watchlist" },
        { status: 409 }
      );
    }

    // Add movie to watchlist
    const newEntry = await Watchlist.create({
      userId,
      movieId,
      movieDetails,
    });

    return NextResponse.json({ success: true, entryId: newEntry._id });
  } catch (error) {
    console.error("Watchlist add error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
