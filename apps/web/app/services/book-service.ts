import type { SearchOptions, VolumeSearchResponse } from "@my-library-app/schemas"

import { volumeSearchResponseSchema } from "@my-library-app/schemas"

type Result<TData, TError extends Error> =
  | { readonly ok: true; readonly value: TData }
  | { readonly ok: false; readonly error: TError }

/**
 * Special search field keywords for Google Books API
 */
export const SEARCH_FIELDS = {
  TITLE: "intitle",
  AUTHOR: "inauthor",
  PUBLISHER: "inpublisher",
  SUBJECT: "subject",
  ISBN: "isbn",
  LCCN: "lccn",
  OCLC: "oclc",
} as const

/**
 * Builds a search query string with optional field specifier
 */
const buildSearchQuery = (options: SearchOptions): string => {
  const { query, field } = options

  if (field) {
    return `${field}:${query}`
  }

  return query
}

/**
 * Builds the complete URL for the Google Books API request
 */
const buildApiUrl = (options: SearchOptions): string => {
  const baseUrl = "https://www.googleapis.com/books/v1/volumes"
  const searchQuery = buildSearchQuery(options)
  const params = new URLSearchParams({
    q: searchQuery,
  })

  if (options.maxResults !== undefined) {
    params.append("maxResults", options.maxResults.toString())
  }

  if (options.startIndex !== undefined) {
    params.append("startIndex", options.startIndex.toString())
  }

  return `${baseUrl}?${params.toString()}`
}

/**
 * Searches for books using the Google Books API
 */
export const searchBooks = async (options: SearchOptions): Promise<Result<VolumeSearchResponse, Error>> => {
  try {
    const url = buildApiUrl(options)
    const response = await fetch(url)

    if (!response.ok) {
      return {
        ok: false,
        error: new Error(`API request failed with status ${response.status}: ${response.statusText}`),
      }
    }

    const rawData = await response.json()

    // Validate the response data with Zod schema
    const parseResult = volumeSearchResponseSchema.safeParse(rawData)

    if (!parseResult.success) {
      return {
        ok: false,
        error: new Error(`Invalid API response: ${parseResult.error.message}`),
      }
    }

    return {
      ok: true,
      value: parseResult.data,
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

/**
 * Searches for books by Library of Congress Control Number
 */
export const searchByLccn = async (
  lccn: string,
  options?: Omit<SearchOptions, "query" | "field">,
): Promise<Result<VolumeSearchResponse, Error>> => {
  return searchBooks({
    query: lccn,
    field: SEARCH_FIELDS.LCCN,
    ...options,
  })
}

/**
 * Searches for books by Online Computer Library Center number
 */
export const searchByOclc = async (
  oclc: string,
  options?: Omit<SearchOptions, "query" | "field">,
): Promise<Result<VolumeSearchResponse, Error>> => {
  return searchBooks({
    query: oclc,
    field: SEARCH_FIELDS.OCLC,
    ...options,
  })
}
