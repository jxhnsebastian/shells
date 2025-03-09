import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getGenreName, getImageUrl } from "@/lib/helpers";
import { TMDBMovie } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { LuCalendar, LuHeart, LuStar } from "react-icons/lu";

interface MovieResultProps {
  result: TMDBMovie;
  mediaType: string;
}

const MovieResult = ({ result, mediaType }: MovieResultProps) => {
  return (
    <Link
      key={result.id}
      href={`/${mediaType}/${result.id}`}
      className="block w-full"
    >
      <Card className="flex flex-row p-3 hover:bg-white/5 transition-colors border-none shadow-sm mb-2">
        <div className="flex-shrink-0 w-[80px] h-[120px] relative overflow-hidden rounded">
          {result.poster_path ? (
            <Image
              src={getImageUrl(result.poster_path, "w92") || ""}
              alt={result.title || result.name || ""}
              width={80}
              height={120}
              className="object-cover w-full h-full rounded"
            />
          ) : (
            <div className="w-full h-full bg-neutral-200 flex items-center justify-center rounded">
              <span className="text-xs text-neutral-500 font-medium">
                No Image
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 ml-0 flex flex-col justify-between">
          <div>
            <h4 className="font-semibold w-fit text-neutral-100 leading-tight truncate">
              {result.title || result.name}
            </h4>

            <div className="flex items-center gap-3 mt-1.5 text-xs">
              {(result.release_date || result.first_air_date) && (
                <div className="flex items-center text-neutral-400">
                  <LuCalendar className="h-3.5 w-3.5 mr-1" />
                  <span>
                    {new Date(
                      result.release_date || result.first_air_date || ""
                    ).getFullYear() || "Unknown"}
                  </span>
                </div>
              )}

              {result.vote_average > 0 && (
                <div className="flex items-center">
                  <LuStar className="h-3.5 w-3.5 mr-1 text-yellow-500" />
                  <span className="font-medium text-neutral-400">
                    {result.vote_average.toFixed(1)}
                  </span>
                </div>
              )}

              {result.vote_count > 0 && (
                <div className="flex items-center">
                  <LuHeart className="h-3.5 w-3.5 mr-1 text-yellow-500" />
                  <span className="font-medium text-neutral-400">
                    {result.vote_count.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {result.genre_ids.slice(0, 2).map((genreId) => {
                const genre = getGenreName(genreId);
                if (!genre) return null;
                return (
                  <Badge
                    key={genreId}
                    variant="secondary"
                    className="px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  >
                    {genre}
                  </Badge>
                );
              })}
            </div>
          </div>

          {result.overview && (
            <p className="text-xs text-justify line-clamp-2 text-neutral-400 mt-1 leading-tight">
              {result.overview}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default MovieResult;
