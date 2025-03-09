import { genres } from "./constants";

const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p";

export const getImageUrl = (path: string | null, size: string = "w500") => {
  if (!path) return null;
  return `${TMDB_IMAGE_URL}/${size}${path}`;
};

export const getGenreName = (genreId: number) => {
  return genres.find((genre) => genre.id === genreId)?.name ?? "";
};
