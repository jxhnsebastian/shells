"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LuHeart, LuCheck, LuStar, LuBook, LuBookMarked } from "react-icons/lu";
import { MediaType, TMDBMovie } from "@/lib/types";
import { getImageUrl } from "@/lib/helpers";
import { Badge } from "../ui/badge";
import {
  addToWatched,
  addToWatchlist,
  removeFromWatched,
  removeFromWatchlist,
} from "@/lib/routes";
import { useSearchContext } from "../context/SearchContext";

interface MediaCardProps {
  media: TMDBMovie;
  mediaType: MediaType;
}

export default function MediaCard({ media, mediaType }: MediaCardProps) {
  const { watchList, setWatchList, watched, setWatched } = useSearchContext();
  const [isHovering, setIsHovering] = useState(false);
  const [isWatched, setIsWatched] = useState(watched.includes(media.id));
  const [isInWatchlist, setIsInWatchlist] = useState(
    watchList.includes(media.id)
  );
  const [isLoading, setIsLoading] = useState(false);

  const title = media.title || media.name || "";
  const releaseDate = media.release_date || media.first_air_date;
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : "";

  const handleAddToWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    try {
      if (isInWatchlist) {
        // Remove from watchlist
        const response = await removeFromWatchlist(media.id);
        if (response && response.success) {
          // Update local state
          setIsInWatchlist(false);
          setWatchList((prevWatchList) =>
            prevWatchList.filter((id) => id !== media.id)
          );
        } else {
          throw new Error("Failed to remove from watchlist");
        }
      } else {
        // Add to watchlist
        const response = await addToWatchlist(media.id, media);
        if (response && response.success) {
          // Update local state
          setIsInWatchlist(true);
          setWatchList((prevWatchList) => [...prevWatchList, media.id]);
        } else {
          throw new Error("Failed to add to watchlist");
        }
      }
    } catch (err) {
      console.error("Watchlist operation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsWatched = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    try {
      if (isWatched) {
        // Remove from watched
        const response = await removeFromWatched(media.id);
        if (response && response.success) {
          // Update local state
          setIsWatched(false);
          setWatched((prevWatched) =>
            prevWatched.filter((id) => id !== media.id)
          );
        } else {
          throw new Error("Failed to remove from watched");
        }
      } else {
        // Add to watched
        const response = await addToWatched(media.id, media);
        if (response && response.success) {
          // Update local state
          setIsWatched(true);
          setWatched((prevWatched) => [...prevWatched, media.id]);

          // If the media is marked as watched, also remove from watchlist if it's there
          if (isInWatchlist) {
            await handleAddToWatchlist(e);
          }
        } else {
          throw new Error("Failed to add to watched");
        }
      }
    } catch (err) {
      console.error("Watched operation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link
      href={`/${mediaType}/${media.id}`}
      className="overflow-hidden bg-white block"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative">
        {/* Poster Image */}
        <div className="aspect-[2/3] relative overflow-hidden">
          {media.poster_path ? (
            <Image
              src={getImageUrl(media.poster_path) || ""}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300"
              style={{
                transform: isHovering ? "scale(1.05)" : "scale(1)",
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}

          {/* Rating badge */}
          {(media.vote_average > 0 || media.vote_count > 0) && (
            <div className="absolute top-2 right-2 bg-charcoal text-almond text-sm font-bold py-1 gap-0.5 rounded-md flex flex-col items-end">
              <div className="flex items-center gap-1 hover:bg-accent px-1 rounded">
                <div className="flex items-center">
                  <LuStar
                    size={14}
                    className="mr-1 fill-yellow-400 text-yellow-400"
                  />
                  {media.vote_average.toFixed(1)}
                </div>
                <div className="flex items-center">
                  <LuHeart
                    size={14}
                    className="mr-1 fill-red-500 text-red-500"
                  />
                  {media.vote_count.toFixed(1)}
                </div>
              </div>
              <Badge variant="secondary" className="h-5 text-xs px-1 rounded">
                {releaseYear}
              </Badge>
            </div>
          )}

          {/* Action buttons */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-end bg-gradient-to-t from-black/70 to-transparent">
            <button
              onClick={handleMarkAsWatched}
              className={`w-6 h-6 border-r flex items-center justify-center cursor-pointer ${
                isWatched ? "bg-green-600" : "bg-white"
              }`}
              title={isWatched ? "Watched" : "Mark as watched"}
            >
              <LuCheck
                size={16}
                className={isWatched ? "text-black" : "text-black"}
              />
            </button>

            <button
              onClick={handleAddToWatchlist}
              className={`w-6 h-6 border-r flex items-center justify-center cursor-pointer ${
                isInWatchlist ? "bg-amber-400" : "bg-white"
              }`}
              title={isInWatchlist ? "Watched" : "Mark as watched"}
            >
              <LuBookMarked
                size={16}
                className={isInWatchlist ? "text-black" : "text-black"}
              />
            </button>
          </div>
        </div>

        {/* Text content */}
        <div className="p-2 bg-black">
          <h3 className="font-bold text-neutral-500 truncate text-md">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
