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
    let url = `https://api.themoviedb.org/3/discover/${media_type}`;

    const params = [];

    if (query) {
      params.push(`with_text_query=${encodeURIComponent(query)}`);
    }

    if (year) {
      params.push(`primary_release_year=${year}`);
    }

    if (include_adult) {
      params.push(`include_adult=${include_adult}`);
    }

    if (page) {
      params.push(`page=${page}`);
    }

    if (sort_by) {
      const date = new Date();
      if (sort_by === "upcoming") {
        date.setDate(date.getDate() + 1);
        params.push(`sort_by=popularity.desc`);
        params.push(
          `primary_release_date.gte=${date.toISOString().split("T")[0]}`
        );
      } else if (sort_by === "recent") {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 3);
        params.push(`sort_by=popularity.desc`);
        params.push(
          `primary_release_date.lte=${date.toISOString().split("T")[0]}`
        );
        params.push(
          `primary_release_date.gte=${sixMonthsAgo.toISOString().split("T")[0]}`
        );
      } else params.push(`sort_by=${sort_by}`);
    }

    if (language) {
      params.push(`with_original_language=${language}`);
    }

    if (params.length > 0) url += "?" + params.join("&");
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
