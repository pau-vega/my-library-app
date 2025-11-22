import type {
  OpenLibraryDoc,
  OpenLibrarySearchResponse,
  SearchOptions,
  Volume,
  VolumeInfo,
  VolumeSearchResponse,
} from "@my-library-app/schemas"

import { openLibrarySearchResponseSchema } from "@my-library-app/schemas"

type Result<TData, TError extends Error> =
  | { readonly ok: true; readonly value: TData }
  | { readonly ok: false; readonly error: TError }

/**
 * Special search field keywords for Open Library API
 */
export const SEARCH_FIELDS = {
  TITLE: "title",
  AUTHOR: "author",
  PUBLISHER: "publisher",
  SUBJECT: "subject",
  ISBN: "isbn",
} as const

/**
 * Builds a search query string with optional field specifier
 */
const buildSearchQuery = (options: SearchOptions): string => {
  const { query, field } = options

  if (field) {
    // Open Library uses field:value format
    return `${field}:${query}`
  }

  return query
}

/**
 * Builds the complete URL for the Open Library API request
 */
const buildApiUrl = (options: SearchOptions): string => {
  const baseUrl = "https://openlibrary.org/search.json"
  const searchQuery = buildSearchQuery(options)
  const params = new URLSearchParams({
    q: searchQuery,
    // Request specific fields to optimize response size and speed
    fields:
      "key,title,subtitle,author_name,author_key,first_publish_year,isbn,cover_i,cover_edition_key,subject,publisher,language,edition_count,number_of_pages_median",
  })

  if (options.maxResults !== undefined) {
    params.append("limit", options.maxResults.toString())
  }

  if (options.startIndex !== undefined) {
    params.append("offset", options.startIndex.toString())
  }

  return `${baseUrl}?${params.toString()}`
}

/**
 * Gets Open Library cover image URL
 */
const getCoverImageUrl = (coverId?: number, size: "S" | "M" | "L" = "M"): string | undefined => {
  if (!coverId) return undefined
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`
}

/**
 * Transforms Open Library document to Volume format
 */
const transformOpenLibraryDocToVolume = (doc: OpenLibraryDoc): Volume => {
  const thumbnail = getCoverImageUrl(doc.cover_i, "M")
  const smallThumbnail = getCoverImageUrl(doc.cover_i, "S")

  const volumeInfo: VolumeInfo = {
    title: doc.title || "Untitled",
    subtitle: doc.subtitle,
    authors: doc.author_name,
    publishedDate: doc.first_publish_year?.toString(),
    categories: doc.subject?.slice(0, 5), // Limit subjects to first 5
    publisher: doc.publisher?.[0],
    language: doc.language?.[0],
    pageCount: doc.number_of_pages_median,
    imageLinks:
      thumbnail || smallThumbnail
        ? {
            thumbnail,
            smallThumbnail,
          }
        : undefined,
    industryIdentifiers: doc.isbn?.slice(0, 5).map((isbn) => ({
      type: isbn.length === 13 ? "ISBN_13" : "ISBN_10",
      identifier: isbn,
    })),
  }

  // Extract Open Library ID from key (e.g., "/works/OL123456W" -> "OL123456W")
  const id = doc.key.split("/").pop() || doc.key

  return {
    id,
    volumeInfo,
    selfLink: `https://openlibrary.org${doc.key}`,
  }
}

/**
 * Transforms Open Library search response to VolumeSearchResponse format
 */
const transformOpenLibraryResponse = (response: OpenLibrarySearchResponse): VolumeSearchResponse => {
  return {
    kind: "openlibrary#volumes",
    totalItems: response.numFound,
    items: response.docs.map(transformOpenLibraryDocToVolume),
  }
}

/**
 * Searches for books using the Open Library API
 */
export const searchBooks = async (options: SearchOptions): Promise<Result<VolumeSearchResponse, Error>> => {
  try {
    const url = buildApiUrl(options)
    const response = await fetch(url, {
      headers: {
        "User-Agent": "My Library App (contact: your-email@example.com)",
      },
    })

    if (!response.ok) {
      return {
        ok: false,
        error: new Error(`API request failed with status ${response.status}: ${response.statusText}`),
      }
    }

    const rawData = await response.json()

    // Validate the Open Library response data with Zod schema
    const parseResult = openLibrarySearchResponseSchema.safeParse(rawData)

    if (!parseResult.success) {
      return {
        ok: false,
        error: new Error(`Invalid API response: ${parseResult.error.message}`),
      }
    }

    // Transform Open Library response to VolumeSearchResponse format
    const transformedResponse = transformOpenLibraryResponse(parseResult.data)

    return {
      ok: true,
      value: transformedResponse,
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error("Unknown error occurred while searching books"),
    }
  }
}

/**
 * Searches for books by title
 */
export const searchByTitle = async (
  title: string,
  options?: Omit<SearchOptions, "query" | "field">,
): Promise<Result<VolumeSearchResponse, Error>> => {
  return searchBooks({
    query: title,
    field: SEARCH_FIELDS.TITLE,
    ...options,
  })
}

/**
 * Searches for books by author
 */
export const searchByAuthor = async (
  author: string,
  options?: Omit<SearchOptions, "query" | "field">,
): Promise<Result<VolumeSearchResponse, Error>> => {
  return searchBooks({
    query: author,
    field: SEARCH_FIELDS.AUTHOR,
    ...options,
  })
}

/**
 * Searches for books by publisher
 */
export const searchByPublisher = async (
  publisher: string,
  options?: Omit<SearchOptions, "query" | "field">,
): Promise<Result<VolumeSearchResponse, Error>> => {
  return searchBooks({
    query: publisher,
    field: SEARCH_FIELDS.PUBLISHER,
    ...options,
  })
}

/**
 * Searches for books by subject/category
 */
export const searchBySubject = async (
  subject: string,
  options?: Omit<SearchOptions, "query" | "field">,
): Promise<Result<VolumeSearchResponse, Error>> => {
  return searchBooks({
    query: subject,
    field: SEARCH_FIELDS.SUBJECT,
    ...options,
  })
}

/**
 * Searches for books by ISBN
 */
export const searchByIsbn = async (
  isbn: string,
  options?: Omit<SearchOptions, "query" | "field">,
): Promise<Result<VolumeSearchResponse, Error>> => {
  return searchBooks({
    query: isbn,
    field: SEARCH_FIELDS.ISBN,
    ...options,
  })
}
