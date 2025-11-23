import { useInfiniteQuery } from "@tanstack/react-query"

import { searchBooks, type SearchOptions, type VolumeSearchResponse } from "../services/book-service"

interface UseInfiniteBookSearchOptions extends Omit<SearchOptions, "startIndex"> {
  readonly enabled?: boolean
}

/**
 * Hook for infinite scrolling book search with any query
 *
 * Provides automatic pagination support with "Load More" functionality.
 * Caches all pages for instant navigation.
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage
 * } = useInfiniteBookSearch({
 *   query: "JavaScript",
 *   maxResults: 20
 * })
 *
 * const allBooks = data?.pages.flatMap((page) => page.items ?? []) ?? []
 *
 * return (
 *   <>
 *     {allBooks.map((book) => (
 *       <BookCard key={book.id} book={book} />
 *     ))}
 *     {hasNextPage && (
 *       <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
 *         {isFetchingNextPage ? "Loading..." : "Load More"}
 *       </button>
 *     )}
 *   </>
 * )
 * ```
 */
export const useInfiniteBookSearch = (options: UseInfiniteBookSearchOptions) => {
  const { query, field, sort, maxResults = 20, enabled } = options

  return useInfiniteQuery<VolumeSearchResponse, Error>({
    queryKey: ["books", "search", "infinite", query, field, sort, maxResults],
    queryFn: async ({ pageParam }) => {
      const result = await searchBooks({
        query,
        field,
        sort,
        maxResults,
        startIndex: pageParam as number,
      })
      if (!result.ok) throw result.error
      return result.value
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedItems = allPages.reduce((acc, page) => acc + (page.items?.length ?? 0), 0)
      return loadedItems < lastPage.totalItems ? loadedItems : undefined
    },
    enabled: enabled !== false && query.length > 0,
    initialPageParam: 0,
  })
}
