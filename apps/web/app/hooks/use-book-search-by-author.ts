import type { VolumeSearchResponse } from "@my-library-app/schemas"

import { useQuery } from "@tanstack/react-query"

import { searchByAuthor } from "../services/book-service"

interface UseBookSearchByAuthorOptions {
  readonly author: string
  readonly maxResults?: number
  readonly startIndex?: number
  readonly enabled?: boolean
}

/**
 * Hook for searching books by author using React Query
 *
 * Automatically caches results and handles loading/error states.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useBookSearchByAuthor({
 *   author: "Robert C. Martin",
 *   maxResults: 20
 * })
 *
 * if (isLoading) return <Spinner />
 * if (data) {
 *   return <BookList books={data.items} />
 * }
 * ```
 */
export const useBookSearchByAuthor = (options: UseBookSearchByAuthorOptions) => {
  const { author, maxResults, startIndex, enabled } = options

  return useQuery<VolumeSearchResponse, Error>({
    queryKey: ["books", "author", author, maxResults, startIndex],
    queryFn: async () => {
      const result = await searchByAuthor(author, { maxResults, startIndex })
      if (!result.ok) throw result.error
      return result.value
    },
    enabled: enabled !== false && author.length > 0,
  })
}
