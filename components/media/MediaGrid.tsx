"use client";

import { MediaType, TMDBMovie } from "@/lib/types";
import MediaCard from "./MediaCard";

interface MediaGridProps {
  items: TMDBMovie[];
  mediaType: MediaType;
}

export default function MediaGrid({
  items,
  mediaType,
}: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-600">no results found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {items.map((item) => (
        <MediaCard
          key={item.id}
          media={item}
          mediaType={mediaType}
          type="short"
        />
      ))}
    </div>
  );
}
