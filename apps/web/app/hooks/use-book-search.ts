import { useQuery } from "@tanstack/react-query"

import { searchBooks, type SearchOptions, type VolumeSearchResponse } from "../services/book-service"

interface UseBookSearchOptions extends SearchOptions {
  readonly enabled?: boolean
}

/**
 * Hook for searching books with the Open Library API using React Query
 *
 * Provides automatic caching, deduplication, and state management for book searches.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useBookSearch({
 *   query: "TypeScript",
 *   maxResults: 10
 * })
 *
 * if (isLoading) return <Spinner />
 * if (error) return <Error error={error} />
 * return <BookList books={data.items} />
 * ```
 */
export const useBookSearch = (options: UseBookSearchOptions) => {
  return useQuery<VolumeSearchResponse, Error>({
    queryKey: ["books", "search", options.query, options.field, options.maxResults, options.startIndex],
    queryFn: async () => {
      const result = await searchBooks(options)
      if (!result.ok) throw result.error
      return result.value
    },
    enabled: options.enabled !== false && options.query.length > 0,
  })
}
