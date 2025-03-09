"use client";

import Link from "next/link";
import Image from "next/image";
import { MediaType, TMDBMovie } from "@/lib/types";
import { getGenreName, getImageUrl } from "@/lib/helpers";
import { LuStar, LuCalendar, LuLoader } from "react-icons/lu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MovieResult from "./MovieResult";

interface SearchResultsProps {
  results: TMDBMovie[];
  isLoading: boolean;
  mediaType: MediaType;
  onSelect?: () => void;
}

export default function SearchResults({
  results,
  isLoading,
  mediaType,
  onSelect,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-24">
        <LuLoader className="h-5 w-5 animate-spin text-gray-500" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No results found</p>
      </div>
    );
  }

  return (
    <div>
      {results.map((result) => (
        <MovieResult result={result} mediaType="movie" />
      ))}
    </div>
  );
}
