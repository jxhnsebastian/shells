"use client";

import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { Currency } from "@/lib/flow-types";
import { getPythPrice } from "@/lib/helpers";
import {
  addToWatched,
  addToWatchlist,
  checkMediaStatus,
  getMediaDetails,
  removeFromWatched,
  removeFromWatchlist,
  searchMedia,
} from "@/lib/routes";
import { MediaType, MovieDetail, TMDBMovie } from "@/lib/types";
import { usePathname } from "next/navigation";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";

interface PriceData {
  [address: string]: number;
}

interface SearchContextProps {
  details: MovieDetail | null;
  setDetails: (value: MovieDetail | null) => void;
  results: TMDBMovie[];
  setResults: (value: TMDBMovie[]) => void;
  movies: TMDBMovie[];
  setMovies: (value: TMDBMovie[]) => void;
  items: (TMDBMovie | MovieDetail)[];
  setItems: (value: (TMDBMovie | MovieDetail)[]) => void;
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
  adult: boolean;
  setAdult: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  isPageLoading: boolean;
  setPageIsLoading: (value: boolean) => void;
  isAdding: boolean;
  setIsAdding: (value: boolean) => void;
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
  prices: PriceData;
  setPrices: React.Dispatch<React.SetStateAction<PriceData>>;

  performSearch: (
    searchQuery: string,
    isPage?: boolean,
    pageNo?: number
  ) => Promise<void>;
  getDetails: (id: number, mediaType?: MediaType) => Promise<void>;
  checkList: (ids: number[]) => Promise<void>;
  handleAddToWatchlist: (
    e: React.MouseEvent,
    media: TMDBMovie | MovieDetail,
    isInWatchlist: boolean,
    setIsInWatchlist: React.Dispatch<React.SetStateAction<boolean>>
  ) => Promise<void>;
  handleMarkAsWatched: (
    e: React.MouseEvent,
    media: TMDBMovie | MovieDetail,
    isWatched: boolean,
    setIsWatched: React.Dispatch<React.SetStateAction<boolean>>
  ) => Promise<void>;

  formatCurrency: (amount: number, currency: Currency) => string;
  convertAmount: (
    amount: number,
    fromCurrency: string,
    toCurrency: Currency
  ) => number;
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

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
  const [sort, setSort] = useState<string>("popularity.desc");
  const [language, setLanguage] = useState<string>("en");
  const [adult, setAdult] = useState<boolean>(true);
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [details, setDetails] = useState<MovieDetail | null>(null);
  const [items, setItems] = useState<(TMDBMovie | MovieDetail)[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isPageLoading, setPageIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalMovies, setTotalMovies] = useState<number>(1);
  const [watched, setWatched] = useState<number[]>([]);
  const [watchList, setWatchList] = useState<number[]>([]);
  const [prices, setPrices] = React.useState<PriceData>({ USD: 0, INR: 1 });

  const debouncedQuery = useDebounce(query, 500);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkList = async (ids: number[]) => {
    const status = await checkMediaStatus(ids);
    setWatched([...new Set([...watched, ...status.watched])]);
    setWatchList([...new Set([...watchList, ...status.watchList])]);
  };

  const performSearch = async (
    searchQuery: string,
    isPage?: boolean,
    pageNo?: number
  ) => {
    if (isLoading) return;
    console.log(searchQuery);
    if (!isPage && (!searchQuery || searchQuery.length < 2)) {
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
        include_adult: adult,
        page: pageNo ?? page,
        year: !isNaN(parsedYear) ? parsedYear : undefined,
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

  const getDetails = async (id: number, mediaType?: MediaType) => {
    if (isPageLoading) return;
    if (!id) {
      setDetails(null);
      return;
    }

    setPageIsLoading(true);

    try {
      const response = await getMediaDetails({
        id,
        media_type: mediaType,
      });

      setDetails(response);
      await checkList([
        response.id,
        ...response.recommendations.results.map((movie) => movie.id),
        ...response.similar.results.map((movie) => movie.id),
      ]);
    } catch (error) {
      console.error("Error:", error);
      setDetails(null);
    } finally {
      setPageIsLoading(false);
    }
  };

  const handleAddToWatchlist = async (
    e: React.MouseEvent,
    media: TMDBMovie | MovieDetail,
    isInWatchlist: boolean,
    setIsInWatchlist: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);

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
          setWatched((prevWatched) =>
            prevWatched.filter((id) => id !== media.id)
          );
        } else {
          throw new Error("Failed to add to watchlist");
        }
      }
    } catch (err) {
      console.error("Watchlist operation failed:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleMarkAsWatched = async (
    e: React.MouseEvent,
    media: TMDBMovie | MovieDetail,
    isWatched: boolean,
    setIsWatched: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);

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
          setWatchList((prevWatchList) =>
            prevWatchList.filter((id) => id !== media.id)
          );
        } else {
          throw new Error("Failed to add to watched");
        }
      }
    } catch (err) {
      console.error("Watched operation failed:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const formatCurrency = (amount: number, currency: Currency) => {
    const symbol = currency === "USD" ? "$" : "₹";
    return `${symbol}${amount.toLocaleString()}`;
  };

  const pythIds = {
    USD: "0ac0f9a2886fc2dd708bc66cc2cea359052ce89d324f45d95fadbc6c4fcf1809",
  };

  const fetchPrices = async () => {
    if (Object.keys(prices).length === 0) return;

    try {
      const tokenArray = Object.values(pythIds);
      const newPrices = await getPythPrice(tokenArray);
      setPrices({ USD: newPrices[pythIds["USD"]] ?? 0, INR: 1 });
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  };

  const convertAmount = (
    amount: number,
    fromCurrency: string,
    toCurrency: Currency
  ): number => {
    if (fromCurrency === toCurrency) return amount;

    if (fromCurrency === "USD" && toCurrency === "INR") {
      return amount * prices.USD;
    } else if (fromCurrency === "INR" && toCurrency === "USD") {
      return amount / prices.USD;
    }
    return amount;
  };

  useEffect(() => {
    if (Object.keys(prices).length > 0) {
      fetchPrices();

      intervalRef.current = setInterval(() => {
        fetchPrices();
      }, 60000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [Object.keys(prices).length]);

  useEffect(() => {
    if (page > 0 && isAuthenticated && pathname?.includes("search"))
      performSearch(query, true);
  }, [page, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && pathname?.includes("search"))
      performSearch(debouncedQuery);
  }, [debouncedQuery, isAuthenticated]);

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
        adult,
        setAdult,
        movies,
        setMovies,
        details,
        setDetails,
        items,
        setItems,
        results,
        setResults,
        isLoading,
        setIsLoading,
        isPageLoading,
        setPageIsLoading,
        isAdding,
        setIsAdding,
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
        prices,
        setPrices,
        performSearch,
        checkList,
        getDetails,
        handleAddToWatchlist,
        handleMarkAsWatched,
        formatCurrency,
        convertAmount
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
