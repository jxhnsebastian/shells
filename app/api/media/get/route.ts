import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import Watchlist from "@/models/Watchlist";
import connectToDatabase from "@/lib/database";
import Watched from "@/models/Watched";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

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

    // Get pagination parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20"); // Default to 20 items per page
    const type = searchParams.get("type") || "watchlist"; // Default to 20 items per page

    // Validate pagination parameters
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    let totalItems: number = 0;
    let totalPages: number = 0;

    // Get paginated items in the user's watchlist
    let items: any[] = [];

    if (type === "watchlist") {
      totalItems = await Watchlist.countDocuments({ userId });
      totalPages = Math.ceil(totalItems / limit);

      items = await Watchlist.find({ userId })
        .sort({ addedAt: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      totalItems = await Watched.countDocuments({ userId });
      totalPages = Math.ceil(totalItems / limit);

      items = await Watched.find({ userId })
        .sort({ addedAt: -1 })
        .skip(skip)
        .limit(limit);
    }

    // Prepare pagination metadata
    const pagination = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return NextResponse.json({
      success: true,
      items: items.map((item) => item.movieDetails),
      pagination,
    });
  } catch (error) {
    console.error("Watchlist get error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
