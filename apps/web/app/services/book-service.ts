import type { SearchBookLanguage, SearchSort } from "@my-library-app/schemas"

import { searchBookResponseSchema } from "@my-library-app/schemas"

type Result<TData, TError extends Error> =
  | { readonly ok: true; readonly value: TData }
  | { readonly ok: false; readonly error: TError }

/**
 * Search field type for book searches
 */
export type SearchField = "title" | "author" | "publisher" | "subject" | "isbn"

/**
 * Options for searching books
 */
export interface SearchOptions {
  readonly query: string
  readonly field?: SearchField
  readonly sort?: SearchSort
  readonly maxResults?: number
  readonly startIndex?: number
}

/**
 * Volume info containing book metadata
 */
export interface VolumeInfo {
  readonly title: string
  readonly authors?: readonly string[]
  readonly publishedDate: string
  readonly categories?: readonly string[]
  readonly publisher?: string
  readonly language?: SearchBookLanguage
  readonly pageCount?: number
  readonly imageLinks?: {
    readonly thumbnail?: string
    readonly smallThumbnail?: string
  }
  readonly industryIdentifiers?: readonly {
    readonly type: "ISBN_10" | "ISBN_13"
    readonly identifier: string
  }[]
}

/**
 * Volume representing a book with its metadata
 */
export interface Volume {
  readonly id: string
  readonly volumeInfo: VolumeInfo
  readonly selfLink: string
}

/**
 * Response from book search containing volumes
 */
export interface VolumeSearchResponse {
  readonly kind: string
  readonly totalItems: number
  readonly items?: readonly Volume[]
}

/**
 * Open Library document from search results
 */
interface OpenLibraryDoc {
  readonly key: string
  readonly title: string
  readonly subtitle?: string
  readonly author_name?: readonly string[]
  readonly author_key?: readonly string[]
  readonly first_publish_year?: number
  readonly isbn?: readonly string[]
  readonly cover_i?: number
  readonly cover_edition_key?: string
  readonly subject?: readonly string[]
  readonly publisher?: readonly string[]
  readonly language?: readonly (SearchBookLanguage | string)[]
  readonly edition_count?: number
  readonly number_of_pages_median?: number
}

/**
 * Open Library search response matching the schema structure
 */
interface OpenLibrarySearchResponse {
  readonly num_found: number
  readonly start: number
  readonly q: string
  readonly documentation_url: string
  readonly docs: readonly OpenLibraryDoc[]
}

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
    type: "work",
    isbn: "*",
    oclc: "*",
    author: "*",
    title: "*",
    publisher: "*",

    // Request specific fields to optimize response size and speed
    fields:
      "key,title,subtitle,author_name,author_key,first_publish_year,isbn,cover_i,cover_edition_key,subject,publisher,language,edition_count,number_of_pages_median",
  })

  if (options.sort) {
    params.append("sort", options.sort)
  }

  if (options.maxResults !== undefined) {
    params.append("limit", options.maxResults.toString())
  }

  if (options.startIndex !== undefined) {
    params.append("offset", options.startIndex.toString())
  }

  //searchBookLanguageOptionsSchema.options.forEach((language) => params.append("language", language))

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
 * Filters and returns the first valid SearchBookLanguage from a list
 */
const getValidLanguage = (languages?: readonly (SearchBookLanguage | string)[]): SearchBookLanguage | undefined => {
  if (!languages) return undefined

  const validLanguages: SearchBookLanguage[] = ["eng", "spa", "cat", "mul"]

  for (const lang of languages) {
    if (validLanguages.includes(lang as SearchBookLanguage)) {
      return lang as SearchBookLanguage
    }
  }

  return undefined
}

/**
 * Transforms Open Library document to Volume format
 */
const transformOpenLibraryDocToVolume = (doc: OpenLibraryDoc): Volume => {
  const thumbnail = getCoverImageUrl(doc.cover_i, "L")
  const smallThumbnail = getCoverImageUrl(doc.cover_i, "S")

  const volumeInfo: VolumeInfo = {
    title: doc.title,
    authors: doc.author_name,
    publishedDate: doc.first_publish_year?.toString() || "Unknown",
    categories: doc.subject?.slice(0, 5), // Limit subjects to first 5
    publisher: doc.publisher?.[0],
    language: getValidLanguage(doc.language),
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
    totalItems: response.num_found,
    items: response.docs.filter((doc) => doc.title).map(transformOpenLibraryDocToVolume),
  }
}

/**
 * Book service for searching books using the Open Library API
 */
export const bookService = {
  /**
   * Searches for books using the Open Library API
   */
  async searchBooks(options: SearchOptions): Promise<Result<VolumeSearchResponse, Error>> {
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
      const parseResult = searchBookResponseSchema.safeParse(rawData)

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
  },

  /**
   * Searches for books by title
   */
  async searchByTitle(
    title: string,
    options?: Omit<SearchOptions, "query" | "field">,
  ): Promise<Result<VolumeSearchResponse, Error>> {
    return this.searchBooks({
      query: title,
      field: SEARCH_FIELDS.TITLE,
      ...options,
    })
  },

  /**
   * Searches for books by author
   */
  async searchByAuthor(
    author: string,
    options?: Omit<SearchOptions, "query" | "field">,
  ): Promise<Result<VolumeSearchResponse, Error>> {
    return this.searchBooks({
      query: author,
      field: SEARCH_FIELDS.AUTHOR,
      ...options,
    })
  },

  /**
   * Searches for books by publisher
   */
  async searchByPublisher(
    publisher: string,
    options?: Omit<SearchOptions, "query" | "field">,
  ): Promise<Result<VolumeSearchResponse, Error>> {
    return this.searchBooks({
      query: publisher,
      field: SEARCH_FIELDS.PUBLISHER,
      ...options,
    })
  },

  /**
   * Searches for books by subject/category
   */
  async searchBySubject(
    subject: string,
    options?: Omit<SearchOptions, "query" | "field">,
  ): Promise<Result<VolumeSearchResponse, Error>> {
    return this.searchBooks({
      query: subject,
      field: SEARCH_FIELDS.SUBJECT,
      ...options,
    })
  },

  /**
   * Searches for books by ISBN
   */
  async searchByIsbn(
    isbn: string,
    options?: Omit<SearchOptions, "query" | "field">,
  ): Promise<Result<VolumeSearchResponse, Error>> {
    return this.searchBooks({
      query: isbn,
      field: SEARCH_FIELDS.ISBN,
      ...options,
    })
  },
}
