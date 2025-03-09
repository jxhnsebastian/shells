"use client";

import { useAuth } from "@/hooks/useAuth";
import { checkMediaStatus, searchMedia } from "@/lib/routes";
import { MediaType, TMDBMovie } from "@/lib/types";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface SearchContextProps {
  results: TMDBMovie[];
  setResults: (value: TMDBMovie[]) => void;
  movies: TMDBMovie[];
  setMovies: (value: TMDBMovie[]) => void;
  items: TMDBMovie[];
  setItems: (value: TMDBMovie[]) => void;
  query: string;
  setQuery: (value: string) => void;
  mediaType: MediaType;
  setMediaType: (value: MediaType) => void;
  year: string;
  setYear: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  isPageLoading: boolean;
  setPageIsLoading: (value: boolean) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  setTotalPages: (value: number) => void;
  totalMovies: number;
  setTotalMovies: (value: number) => void;
  watched: number[];
  setWatched: React.Dispatch<React.SetStateAction<number[]>>;
  watchList: number[];
  setWatchList: React.Dispatch<React.SetStateAction<number[]>>;

  performSearch: (searchQuery: string, isPage?: boolean) => Promise<void>;
  checkList: (ids: number[]) => Promise<void>;
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setWatchList([]);
      setWatched([]);
    }
  }, [isAuthenticated]);

  const [query, setQuery] = useState<string>("");
  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [year, setYear] = useState<string>("");
  const [sort, setSort] = useState<string>("vote_average.desc");
  const [language, setLanguage] = useState<string>("en");
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [items, setItems] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPageLoading, setPageIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalMovies, setTotalMovies] = useState<number>(1);
  const [watched, setWatched] = useState<number[]>([]);
  const [watchList, setWatchList] = useState<number[]>([]);

  const checkList = async (ids: number[]) => {
    const status = await checkMediaStatus(ids);
    setWatched(status.watched);
    setWatchList(status.watchList);
  };

  const performSearch = async (searchQuery: string, isPage?: boolean) => {
    if (isLoading) return;
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setTotalPages(0);
      setTotalMovies(0);
      return;
    }

    setIsLoading(true);
    isPage && setPageIsLoading(true);

    try {
      const parsedYear = parseInt(year);
      const response = await searchMedia({
        query: searchQuery,
        media_type: mediaType,
        include_adult: true,
        page: page,
        year:
          !isNaN(parsedYear) && parsedYear <= new Date().getFullYear()
            ? parsedYear
            : undefined,
        sort_by: sort,
        language: language || undefined,
      });

      setResults(response.results);
      isPage && setMovies(response.results);
      setTotalPages(response.total_pages);
      setTotalMovies(response.total_results);
      await checkList(response.results.map((movie) => movie.id));
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      isPage && setMovies([]);
      setTotalPages(0);
      setTotalMovies(0);
    } finally {
      setIsLoading(false);
      isPage && setPageIsLoading(false);
    }
  };

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        mediaType,
        setMediaType,
        year,
        setYear,
        sort,
        setSort,
        language,
        setLanguage,
        movies,
        setMovies,
        items,
        setItems,
        results,
        setResults,
        isLoading,
        setIsLoading,
        isPageLoading,
        setPageIsLoading,
        page,
        setPage,
        totalPages,
        setTotalPages,
        totalMovies,
        setTotalMovies,
        watched,
        setWatched,
        watchList,
        setWatchList,
        performSearch,
        checkList,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
};
