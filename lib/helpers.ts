import { genres } from "./constants";

const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p";

export const getImageUrl = (path: string | null, size: string = "w500") => {
  if (!path) return null;
  return `${TMDB_IMAGE_URL}/${size}${path}`;
};

export const getGenreName = (genreId: number) => {
  return genres.find((genre) => genre.id === genreId)?.name ?? "";
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
export const maxRetries = 5;
export const wait = 2;

/**
 * Fetches data from a URL with retry logic
 * @param url The URL to fetch data from
 * @param options Optional fetch options
 * @returns The parsed JSON response
 */
export async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  log: any = console.log
): Promise<T> {
  let retryCount = 0;

  while (true) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        log(`${url} rate limited. Retrying in ${2 ** retryCount}s`);
        await sleep(2 ** retryCount * 1000);
        retryCount++;
        continue;
      }

      if (response.status === 404) {
        log(`Error for ${url}: 404 not found`);
        retryCount = maxRetries;
        throw new Error(`Error for ${url}: 404 not found`);
      }

      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}: ${response.statusText}`
        );
      }

      return (await response.json()) as T;
    } catch (error: any) {
      if (retryCount < maxRetries) {
        log(
          `Error for ${url}: ${
            error?.message ?? "Unknown error"
          }, retrying in ${2 ** retryCount}s (attempt ${
            retryCount + 1
          }/${maxRetries})`
        );

        await sleep(2 ** retryCount * 1000);
        retryCount++;
        continue;
      }

      throw error;
    }
  }
}

export async function getPythPrice(
  ids: string[],
  timeInSec?: number
): Promise<Record<string, number>> {
  const idsQueryParams = ids.map((id) => `ids%5B%5D=${id}`).join("&");

  const data = await fetchWithRetry<any>(
    `https://hermes.pyth.network/v2/updates/price/${
      timeInSec ? timeInSec.toFixed(0) : "latest"
    }?${idsQueryParams}`
  );

  const result: Record<string, number> = {};

  if (data.parsed && Array.isArray(data.parsed)) {
    for (const item of data.parsed) {
      if (item.price && item.id) {
        if (timeInSec && item.price.publish_time + 2 < timeInSec) {
          throw new Error(`Stale price feed for ID: ${item.id}!`);
        }

        const calculatedPrice =
          item.price.price * Math.pow(10, item.price.expo);
        result[item.id] = calculatedPrice;
      }
    }
  }

  return result;
}
