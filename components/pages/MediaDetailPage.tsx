"use client";

import {
  Loader,
  Star,
  Heart,
  Calendar,
  Clock,
  Check,
  BookMarked,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { MovieTabNavigation } from "../details-page/tabs";
import { MovieMetadataItem } from "../details-page/metadata";
import { SectionHeader } from "../details-page/header";
import { CastCard } from "../media/CastCard";
import { useSearchContext } from "../context/SearchContext";
import { getImageUrl } from "@/lib/helpers";
import { Badge } from "../ui/badge";
import MediaCard from "../media/MediaCard";
import { MediaType } from "@/lib/types";

export default function MediaDetailsPage({
  id,
  mediaType,
}: {
  id: string;
  mediaType: string;
}) {
  const {
    getDetails,
    details,
    watchList,
    watched,
    handleAddToWatchlist,
    handleMarkAsWatched,
    isLoading,
  } = useSearchContext();
  const [isWatched, setIsWatched] = useState<boolean>(
    details ? watched.includes(details.id) : false
  );
  const [isInWatchlist, setIsInWatchlist] = useState<boolean>(
    details ? watchList.includes(details.id) : false
  );
  const [activeTab, setActiveTab] = useState("overview");
  const tabs = [
    "overview",
    "cast",
    "crew",
    "videos",
    "photos",
    "recommendations",
    "similar",
  ];

  useEffect(() => {
    if (details) {
      setIsWatched(watched.includes(details.id));
      setIsInWatchlist(watchList.includes(details.id));
    }
  }, [watched, watchList]);

  useEffect(() => {
    getDetails(parseInt(id), mediaType as MediaType);
  }, [id]);

  const releaseYear = details?.release_date
    ? new Date(details?.release_date).getFullYear()
    : "";
  const director = details?.credits.crew.find(
    (item) => item.job === "Director"
  );

  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-1">
          loading details
          <Loader className="h-5 w-5 animate-spin text-gray-500" />
        </div>
      }
    >
      {!details || isLoading ? (
        <div className="flex items-center gap-1">
          loading details
          <Loader className="h-5 w-5 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="bg-gradient-to-b from-white/0 mt-[28%] to-black text-white">
          {/* Background image */}
          <div className="absolute min-h-screen inset-0 z-0 opacity-80">
            <Image
              src={getImageUrl(details?.backdrop_path, "original") || ""}
              alt="Movie background"
              fill
              className="object-cover max-h-[80dvh]"
              priority
            />
            <div className="absolute bottom-0 w-full h-[40dvh] bg-gradient-to-t from-black from-10% via-black via-20% to-black/10"></div>
          </div>

          {/* Main content */}
          <main className="relative z-10 px-6 pt-6 pb-10">
            <div className="flex flex-col md:flex-row gap-8 max-w-6xl">
              {/* Movie poster */}
              <div className="flex-shrink-0">
                <div className="w-64 h-96 rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={getImageUrl(details.poster_path, "w342") || ""}
                    alt="Poster"
                    width={400}
                    height={600}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              {/* Movie details */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold">
                  {details.title} ({releaseYear})
                </h1>
                <p className="text-neutral-300 italic mb-0">
                  {details.tagline}
                </p>

                {/* Ratings and info */}
                <div className="flex flex-wrap gap-2 mb-1">
                  <div className="bg-transparent text-neutral-300 rounded flex items-center space-x-2">
                    <div className="flex items-center">
                      <Star className="h-3.5 w-3.5 mr-1 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {details.vote_average.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-3.5 w-3.5 mr-1 fill-red-500 text-red-500" />
                      <span className="font-medium">
                        {details.vote_count.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-white" />
                      <span className="font-medium">
                        {details?.release_date ?? ""}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1 text-white" />
                      <span className="font-medium">2h 19m</span>
                    </div>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {details.genres.map((genre, index) => {
                    return (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-2 py-0.5 text-xs font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded cursor-pointer"
                      >
                        {genre.name.toLowerCase()}
                      </Badge>
                    );
                  })}
                </div>

                {/* Action buttons */}
                <div className="flex mb-8 gap-1">
                  <button
                    onClick={(e) =>
                      handleMarkAsWatched(e, details, isWatched, setIsWatched)
                    }
                    disabled={isLoading}
                    className={`w-6 h-6 border-r flex items-center justify-center cursor-pointer rounded ${
                      isWatched ? "bg-green-600" : "bg-white"
                    }`}
                    title={isWatched ? "Watched" : "Mark as watched"}
                  >
                    <Check
                      size={16}
                      className={isWatched ? "text-black" : "text-black"}
                    />
                  </button>

                  <button
                    onClick={(e) =>
                      handleAddToWatchlist(
                        e,
                        details,
                        isWatched,
                        setIsInWatchlist
                      )
                    }
                    disabled={isLoading}
                    className={`w-6 h-6 border-r flex items-center justify-center cursor-pointer rounded ${
                      isInWatchlist ? "bg-amber-400" : "bg-white"
                    }`}
                    title={isInWatchlist ? "Watched" : "Mark as watched"}
                  >
                    <BookMarked
                      size={16}
                      className={isInWatchlist ? "text-black" : "text-black"}
                    />
                  </button>
                </div>

                <div className="md:col-span-3">
                  <p className="text-gray-200 leading-relaxed mb-8">
                    {details.overview}
                  </p>

                  <div className="flex text-sm gap-4">
                    <div>
                      <h3 className="text-gray-400 mb-2">director</h3>
                      <Link href="#" className="text-white hover:underline">
                        {director?.name.toLowerCase() || ""}
                      </Link>
                    </div>
                    <div>
                      <h3 className="text-gray-400 mb-2">country</h3>
                      <div>
                        {details.production_countries
                          ?.map((country) => country.iso_3166_1.toLowerCase())
                          .join(", ") ?? ""}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-gray-400 mb-2">languages</h3>
                      {details.spoken_languages
                        ?.map((language) => language.english_name.toLowerCase())
                        .join(", ")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Tabs navigation */}
          <MovieTabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={tabs}
          />

          {/* Movie content based on active tab */}
          <div className="relative z-10 py-8">
            <div className="max-w-6xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar with movie metadata */}
                {activeTab === "overview" && (
                  <div className="md:col-span-1">
                    <div className="bg-black/40 p-4 rounded-lg">
                      <MovieMetadataItem
                        label="original title"
                        value={details.original_title}
                      />
                      <MovieMetadataItem
                        label="status"
                        value={details.status.toLowerCase()}
                      />
                      <MovieMetadataItem
                        label="production companies"
                        value={
                          <>
                            {details.production_companies.map(
                              (company, index) => (
                                <div key={index}>{company.name}</div>
                              )
                            )}
                          </>
                        }
                      />
                      <MovieMetadataItem
                        label="original language"
                        value={details.original_language}
                      />
                      <MovieMetadataItem
                        label="budget"
                        value={`$${details?.budget?.toLocaleString()}`}
                      />
                      <MovieMetadataItem
                        label="revenue"
                        value={`$${details?.revenue?.toLocaleString()}`}
                      />
                    </div>
                  </div>
                )}

                {/* Synopsis and details */}
                <div
                  className={`${
                    activeTab === "overview" ? "md:col-span-3" : "md:col-span-4"
                  }`}
                >
                  {/* Top Cast Section */}
                  {(activeTab === "overview" || activeTab === "cast") && (
                    <div className="mb-16">
                      <SectionHeader title="cast" setTab={setActiveTab} />
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {details.credits.cast
                          .slice(
                            0,
                            activeTab === "overview"
                              ? 5
                              : details.credits.cast.length
                          )
                          .map((actor) => (
                            <CastCard
                              key={actor.id}
                              image={
                                getImageUrl(actor.profile_path, "w185") || ""
                              }
                              name={actor.name}
                              character={actor.character}
                            />
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations Section */}
                  {(activeTab === "overview" ||
                    activeTab === "recommendations") && (
                    <div className="mb-16">
                      <SectionHeader
                        title="recommendations"
                        setTab={setActiveTab}
                      />
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {details.recommendations.results
                          .sort((a, b) => b.popularity - a.popularity)
                          .slice(
                            0,
                            activeTab === "overview"
                              ? 5
                              : details.recommendations.results.length
                          )
                          .map((item) => (
                            <MediaCard
                              key={item.id}
                              media={item}
                              mediaType={mediaType}
                              type="short"
                            />
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Similar Section */}
                  {(activeTab === "overview" || activeTab === "similar") && (
                    <div className="mb-16">
                      <SectionHeader title="similar" setTab={setActiveTab} />
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {details.similar.results
                          .sort((a, b) => b.popularity - a.popularity)
                          .slice(
                            0,
                            activeTab === "overview"
                              ? 5
                              : details.similar.results.length
                          )
                          .map((item) => (
                            <MediaCard
                              key={item.id}
                              media={item}
                              mediaType={mediaType}
                              type="short"
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Suspense>
  );
}
