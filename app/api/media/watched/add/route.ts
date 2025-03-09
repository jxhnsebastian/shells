import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import Watched from "@/models/Watched";
import Watchlist from "@/models/Watchlist";
import connectToDatabase from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { movieId, movieDetails, rating, review } = await request.json();

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

    // Check if movie is already watched
    const existingEntry = await Watched.findOne({ userId, movieId });

    if (existingEntry) {
      existingEntry.rating = rating || existingEntry.rating;
      existingEntry.review = review || existingEntry.review;
      existingEntry.updatedAt = new Date();
      await existingEntry.save();

      return NextResponse.json({
        success: true,
        message: "Watched movie updated",
        entryId: existingEntry._id,
      });
    }

    // Add movie to watched list
    const newEntry = await Watched.create({
      userId,
      movieId,
      movieDetails,
      rating,
      review,
    });

    // If movie exists in watchlist, remove it
    await Watchlist.deleteOne({ userId, movieId });

    return NextResponse.json({ success: true, entryId: newEntry._id });
  } catch (error) {
    console.error("Watched add error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
