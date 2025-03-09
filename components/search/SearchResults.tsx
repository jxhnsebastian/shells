"use client";

import { TMDBMovie } from "@/lib/types";
import { Loader } from "lucide-react";
import MediaCard from "../media/MediaCard";

interface SearchResultsProps {
  results: TMDBMovie[];
  isLoading: boolean;
}

export default function SearchResults({
  results,
  isLoading,
}: SearchResultsProps) {
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
    <div>
      {results.map((result, index) => (
        <MediaCard key={index} media={result} mediaType="movie" type="long" />
      ))}
    </div>
  );
}
