import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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
