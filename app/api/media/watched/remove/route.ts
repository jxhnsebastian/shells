import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import Watched from "@/models/Watched";
import connectToDatabase from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { movieId } = await request.json();

    if (!movieId) {
      return NextResponse.json({ error: "Movie ID is required" }, { status: 400 });
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

    // Remove movie from watched list
    const result = await Watched.deleteOne({ userId, movieId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Movie not found in watched list" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Watched remove error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
