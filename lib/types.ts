export type MediaType = "movie" | "tv";

export interface TMDBMovie {
  id: number;
  adult: boolean;
  original_title: string;
  title: string;
  name?: string; // Used for TV shows
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  first_air_date?: string; // Used for TV shows
  vote_average: number;
  popularity: number;
  original_language: string;
  genre_ids: number[];
  video: boolean;
  vote_count: number;
}

export interface SearchParams {
  query?: string;
  page?: number;
  year?: number;
  sort_by?: string;
  language?: string;
  include_adult?: boolean;
  media_type?: MediaType;
}

export interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}
