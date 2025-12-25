import { useQuery } from "@tanstack/react-query"

import { bookService, type VolumeSearchResponse } from "../services/book-service"

interface UseBookSearchByTitleOptions {
  readonly title: string
  readonly maxResults?: number
  readonly startIndex?: number
  readonly enabled?: boolean
}

/**
 * Hook for searching books by title using React Query
 *
 * Automatically caches results and handles loading/error states.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useBookSearchByTitle({
 *   title: "Clean Code",
 *   maxResults: 10
 * })
 *
 * if (isLoading) return <Spinner />
 * if (error) return <p>Error: {error.message}</p>
 * if (data) {
 *   console.log(`Found ${data.totalItems} books`)
 * }
 * ```
 */
export const useBookSearchByTitle = (options: UseBookSearchByTitleOptions) => {
  const { title, maxResults, startIndex, enabled } = options

  return useQuery<VolumeSearchResponse, Error>({
    queryKey: ["books", "title", title, maxResults, startIndex],
    queryFn: async () => {
      const result = await bookService.searchByTitle(title, { maxResults, startIndex })
      if (!result.ok) throw result.error
      return result.value
    },
    enabled: enabled !== false && title.length > 0,
  })
}
