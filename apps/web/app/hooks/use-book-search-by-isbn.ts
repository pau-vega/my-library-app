import { useQuery } from "@tanstack/react-query"

import { searchByIsbn, type VolumeSearchResponse } from "../services/book-service"

interface UseBookSearchByIsbnOptions {
  readonly isbn: string
  readonly maxResults?: number
  readonly startIndex?: number
  readonly enabled?: boolean
}

/**
 * Hook for searching books by ISBN using React Query
 *
 * Useful for looking up specific editions of books.
 * Results are automatically cached for instant lookups.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useBookSearchByIsbn({
 *   isbn: "9780134685991"
 * })
 *
 * if (isLoading) return <Spinner />
 * if (data?.items?.[0]) {
 *   return <BookDetails book={data.items[0]} />
 * }
 * ```
 */
export const useBookSearchByIsbn = (options: UseBookSearchByIsbnOptions) => {
  const { isbn, maxResults, startIndex, enabled } = options

  return useQuery<VolumeSearchResponse, Error>({
    queryKey: ["books", "isbn", isbn, maxResults, startIndex],
    queryFn: async () => {
      const result = await searchByIsbn(isbn, { maxResults, startIndex })
      if (!result.ok) throw result.error
      return result.value
    },
    enabled: enabled !== false && isbn.length >= 10,
  })
}
