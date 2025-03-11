"use client";

import { Suspense } from "react";
import MediaGrid from "@/components/media/MediaGrid";
import SearchBar from "@/components/search/SearchBar";
import { Pagination } from "@/components/ui/pagination";
import { useSearchContext } from "@/components/context/SearchContext";
import { Loader } from "lucide-react";

export default function SearchPage() {
  const { movies, page, setPage, totalPages, isPageLoading, mediaType } =
    useSearchContext();

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
            <div className="flex items-center gap-1">
              loading movies
              <Loader className="h-5 w-5 animate-spin text-gray-500" />
            </div>
          }
        >
          {isPageLoading && (
            <div className="flex items-center gap-1">
              loading page {page}
              <Loader className="h-5 w-5 animate-spin text-gray-500" />
            </div>
          )}
          <MediaGrid items={movies} mediaType={mediaType} />
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
