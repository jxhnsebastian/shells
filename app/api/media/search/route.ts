import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

// Configure rate limit: 1 request per second
const RATE_LIMIT_CONFIG = {
  limit: 1,
  window: 1000, // 1 second in milliseconds
};

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = rateLimit(request, RATE_LIMIT_CONFIG);
  if (rateLimitResult) return rateLimitResult;

  try {
    const {
      query,
      media_type = "movie",
      year,
      include_adult,
      page,
      sort_by,
      language,
    } = await request.json();

    // Build the URL with query parameters
    let url = `https://api.themoviedb.org/3/search/${media_type}?query=${encodeURIComponent(
      query
    )}`;

    if (year) {
      url += `&primary_release_year=${year}`;
    }

    if (include_adult) {
      url += `&include_adult=${include_adult}`;
    }

    if (page) {
      url += `&page=${page}`;
    }

    if (sort_by) {
      url += `&sort_by=${sort_by}`;
    }

    if (language) {
      url += `&with_original_language=${language}`;
    }

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
