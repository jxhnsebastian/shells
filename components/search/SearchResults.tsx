"use client";

import { MovieDetail, TMDBMovie } from "@/lib/types";
import { Loader } from "lucide-react";
import MediaCard from "../media/MediaCard";
import { useSearchContext } from "../context/SearchContext";

interface SearchResultsProps {
  results: (TMDBMovie | MovieDetail)[];
  isLoading: boolean;
  layout?: "grid" | "list";
}

export default function SearchResults({
  results,
  isLoading,
  layout,
}: SearchResultsProps) {
  const { mediaType } = useSearchContext();
  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-24">
        <Loader className="h-5 w-5 animate-spin text-gray-500" />
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
    <div
      className={
        layout === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : ""
      }
    >
      {results.map((result, index) => (
        <MediaCard
          key={index}
          media={result}
          mediaType={mediaType}
          type="long"
        />
      ))}
    </div>
  );
}
