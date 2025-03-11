"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Tv,
  X,
  Search,
  Calendar,
  Filter,
  Globe,
  Check,
  LucideFilm,
  CatIcon,
} from "lucide-react";
import { MediaType } from "@/lib/types";
import SearchResults from "./SearchResults";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { languages, sortOptions } from "@/lib/constants";
import { useSearchContext } from "../context/SearchContext";
import { Checkbox } from "../ui/checkbox";

export default function SearchBar() {
  const {
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
    results,
    isLoading,
    page,
    totalPages,
    totalMovies,
    performSearch,
  } = useSearchContext();

  const [isFocused, setIsFocused] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (year) count++;
    if (sort) count++;
    if (language) count++;
    if (adult) count++;
    setActiveFilters(count);
  }, [year, sort, language]);

  const handleClearSearch = () => {
    setQuery("");
    searchInputRef.current?.focus();
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      searchContainerRef.current &&
      !searchContainerRef.current.contains(e.target as Node)
    ) {
      setIsFocused(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleViewAllResults = () => {
    setMovies(results);
    setIsFocused(false);
  };

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-2xl mx-auto">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          performSearch(query);
        }}
        className="space-y-2 flex flex-col"
      >
        <div className="flex items-center w-full bg-background border rounded-lg shadow-sm">
          <Select
            value={mediaType}
            onValueChange={(value) => setMediaType(value as MediaType)}
          >
            <SelectTrigger className="w-auto h-8 text-xs gap-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0">
              {mediaType === "movie" ? (
                <LucideFilm className="w-5 h-5" />
              ) : (
                <Tv className="w-4 h-4" />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="movie">movie</SelectItem>
              <SelectItem value="tv">tv</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1 flex items-center">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={`search ${
                mediaType === "movie" ? "movies" : "tv shows"
              }...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            {query && (
              <Button
                type="button"
                onClick={handleClearSearch}
                variant="ghost"
                size="icon"
                className="h-8 w-8 absolute right-12"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="mx-2 cursor-pointer"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-row flex-wrap max-w-full items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{year || "year"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-0 w-32">
              <Input
                type="text"
                placeholder="enter year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                onFocus={() => setIsFocused(true)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </PopoverContent>
          </Popover>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-auto h-8 gap-1">
              <Filter className="h-3.5 w-3.5" />
              <SelectValue>
                {(sortOptions[sort] || sort).toLowerCase()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.keys(sortOptions).map((sort, index) => (
                <SelectItem key={index} value={sort}>
                  {sortOptions[sort].toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Globe className="h-3.5 w-3.5" />
                <span className="max-w-[100px] truncate">
                  {language
                    ? (
                        languages.find((lang) => lang.iso_639_1 === language)
                          ?.english_name || language
                      ).toLowerCase()
                    : "all languages"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-0" align="start">
              <Command>
                <CommandInput placeholder="search language..." />
                <CommandList>
                  <CommandEmpty>No language found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value=""
                      onSelect={() => setLanguage("")}
                      className="flex items-center gap-2"
                    >
                      {!language && <Check className="h-4 w-4" />}
                      <span className="ml-2">all languages</span>
                    </CommandItem>
                    {languages
                      .sort((a, b) =>
                        a.english_name.localeCompare(b.english_name)
                      )
                      .map((lang) => (
                        <CommandItem
                          key={lang.iso_639_1}
                          value={lang.english_name}
                          onSelect={() => setLanguage(lang.iso_639_1)}
                          className="flex items-center gap-2"
                        >
                          {language === lang.iso_639_1 && (
                            <Check className="h-4 w-4" />
                          )}
                          <span className="ml-2">
                            {lang.english_name.toLowerCase()}
                            {lang.name &&
                              lang.name !== lang.english_name &&
                              ` (${lang.name})`}
                          </span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="flex items-center space-x-2 border rounded-md px-0.5 h-[31px]">
            <Checkbox
              checked={adult}
              onClick={() => {
                setAdult(!adult);
              }}
              id="adult"
              className="border-white"
            />
            <CatIcon />
          </div>

          {activeFilters > 0 && (
            <Badge
              onClick={() => {
                performSearch(query, true, 1);
              }}
              variant="secondary"
              className="h-5 text-xs px-2 cursor-pointer"
            >
              apply {activeFilters} filter{activeFilters > 1 ? "s" : ""}
            </Badge>
          )}

          {movies.length > 0 && (
            <Badge variant="secondary" className="h-5 text-xs px-2">
              page {page} of {totalPages}. total {totalMovies}
              {mediaType === "movie" ? " movies" : " shows"}
            </Badge>
          )}
        </div>
      </form>

      {/* Search results dropdown */}
      {isFocused && query.length > 0 && (
        <div className="absolute left-0 right-0 z-10 mt-1 bg-background border rounded-lg shadow-md overflow-hidden">
          <SearchResults results={results.slice(0, 3)} isLoading={isLoading} />
          {results.length > 0 && (
            <div className="p-2 text-center border-t">
              <Button
                onClick={handleViewAllResults}
                variant="ghost"
                className="text-xs w-full cursor-pointer"
              >
                view all results
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
