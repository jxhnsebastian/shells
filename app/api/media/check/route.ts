// app/api/watchlist/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import Watched from "@/models/Watched";
import Watchlist from "@/models/Watchlist";

export async function POST(request: NextRequest) {
  try {
    // Get the current user from the session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Get userId from session
    const userId = (session.user as any).id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }

    // Parse the request body to get the movie IDs array
    const body = await request.json();
    const { movieIds } = body;

    if (!movieIds || !Array.isArray(movieIds)) {
      return NextResponse.json(
        { error: "Movie IDs must be provided as an array" },
        { status: 400 }
      );
    }

    // Convert movieIds to numbers if they aren't already
    const normalizedMovieIds = movieIds.map((id) => Number(id));

    // Query the database to find which movies are in the user's watchlist
    const watchedItems = await Watched.find({
      userId,
      movieId: { $in: normalizedMovieIds },
    }).select("movieId -_id");

    const watchListItems = await Watchlist.find({
      userId,
      movieId: { $in: normalizedMovieIds },
    }).select("movieId -_id");

    // Extract just the movie IDs from the results
    const watched = watchedItems.map((item) => item.movieId);
    const watchList = watchListItems.map((item) => item.movieId);

    return NextResponse.json({ watched, watchList });
  } catch (error) {
    console.error("Error checking watchlist:", error);
    return NextResponse.json(
      { error: "Failed to check watchlist" },
      { status: 500 }
    );
  }
}
