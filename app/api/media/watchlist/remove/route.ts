import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import Watchlist from "@/models/Watchlist";
import connectToDatabase from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { movieId } = await request.json();

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

    // Remove from watchlist
    const result = await Watchlist.deleteOne({ userId, movieId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Movie not found in watchlist" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Watchlist remove error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
