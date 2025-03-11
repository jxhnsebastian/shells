import { MovieDetail, SearchParams, TMDBResponse } from "./types";

const API_BASE = "/api/media/watchlist";

export async function addToWatchlist(movieId: number, movieDetails: any) {
  try {
    const response = await fetch(`${API_BASE}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId, movieDetails }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    throw error;
  }
}

export async function removeFromWatchlist(movieId: number) {
  try {
    const response = await fetch(`${API_BASE}/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    throw error;
  }
}

const WATCHED_API_BASE = "/api/media/watched";

export async function addToWatched(
  movieId: number,
  movieDetails: any,
  rating?: number,
  review?: string
) {
  try {
    const response = await fetch(`${WATCHED_API_BASE}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId, movieDetails, rating, review }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error adding to watched:", error);
    throw error;
  }
}

export async function removeFromWatched(movieId: number) {
  try {
    const response = await fetch(`${WATCHED_API_BASE}/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error removing from watched:", error);
    throw error;
  }
}

export async function getList(
  type: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  success: boolean;
  items: any[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: string;
}> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    queryParams.append("type", type);

    const response = await fetch(`/api/media/get?${queryParams.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return {
      success: false,
      items: [],
      error:
        error instanceof Error ? error.message : "Failed to fetch watchlist",
    };
  }
}

export async function searchMedia(params: SearchParams): Promise<TMDBResponse> {
  try {
    const response = await fetch("/api/media/discover", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching from API:", error);
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
}

export async function getMediaDetails(params: {
  id: number;
  media_type?: string;
}): Promise<MovieDetail> {
  try {
    const response = await fetch("/api/media/details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching from API:", error);
    return {} as MovieDetail;
  }
}

export async function checkMediaStatus(
  movieIds: number[]
): Promise<{ watched: number[]; watchList: number[] }> {
  try {
    const response = await fetch(`/api/media/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ movieIds }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error || `Error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to check watchlist status:", error);
    return { watched: [], watchList: [] };
  }
}
