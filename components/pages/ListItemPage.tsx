"use client";

import { useState, useEffect } from "react";
import { getList } from "@/lib/routes";
import { LuLoader } from "react-icons/lu";
import SearchResults from "../search/SearchResults";
import { Pagination } from "@/components/ui/pagination";
import { TMDBMovie } from "@/lib/types";

export default function ListItemPage({ listType }: { listType: string }) {
  const [items, setItems] = useState<TMDBMovie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { items, pagination } = await getList(listType, page, 20);
        setItems(items);
        setTotalPages(pagination?.totalPages ?? 1);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [listType, page]); // Re-fetch when listType or page changes

  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-500">
          Loading your {listType} <LuLoader className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <>
          <h4 className="font-semibold w-fit text-neutral-100 leading-tight truncate">
            your {listType}
          </h4>

          <SearchResults
            results={items}
            isLoading={isLoading}
            mediaType="movie"
          />

          <Pagination
            page={page}
            setPage={setPage}
            items={items}
            maxPages={totalPages}
          />
        </>
      )}
    </div>
  );
}
