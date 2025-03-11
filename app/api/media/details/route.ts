import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

// Configure rate limit: 1 request per second
const RATE_LIMIT_CONFIG = {
  limit: 2,
  window: 1000, // 1 second in milliseconds
};

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = rateLimit(request, RATE_LIMIT_CONFIG);
  if (rateLimitResult) return rateLimitResult;

  try {
    const {
      id,
      media_type = "movie",
    } = await request.json();

    // Build the URL with query parameters
    const url = `https://api.themoviedb.org/3/${media_type}/${id}?append_to_response=credits%2Csimilar%2Crecommendations&language=en-US`;

    console.log(url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.status_message || "TMDB API error" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
