"use client";

import { useEffect, Suspense } from "react";
import MediaGrid from "@/components/media/MediaGrid";
import SearchBar from "@/components/search/SearchBar";
import { Pagination } from "@/components/ui/pagination";
import { useSearchContext } from "@/components/context/SearchContext";
import { LuLoader } from "react-icons/lu";

export default function SearchPage() {
  const {
    query,
    movies,
    page,
    setPage,
    totalPages,
    totalMovies,
    performSearch,
    isPageLoading,
  } = useSearchContext();

  useEffect(() => {
    if (page > 0) performSearch(query, true);
  }, [page]);

  return (
    <div className="space-y-8">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="mt-6">
          <Suspense fallback={<div>loading search...</div>}>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      <div>
        <Suspense
          fallback={
            <div>
              loading movies{" "}
              <LuLoader className="h-5 w-5 animate-spin text-gray-500" />
            </div>
          }
        >
          {isPageLoading && (
            <div>
              loading page {page}{" "}
              <LuLoader className="h-5 w-5 animate-spin text-gray-500" />
            </div>
          )}
          <MediaGrid items={movies} mediaType={"movie"} />
          <Pagination
            page={page}
            setPage={setPage}
            items={movies}
            maxPages={totalPages}
          />
        </Suspense>
      </div>
    </div>
  );
}
