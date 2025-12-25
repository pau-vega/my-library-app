import { useInfiniteQuery } from "@tanstack/react-query"

import { bookService, type VolumeSearchResponse } from "../services/book-service"

interface UseInfiniteBooksByTitleOptions {
  readonly title: string
  readonly maxResults?: number
  readonly enabled?: boolean
}

/**
 * Hook for infinite scrolling book search by title
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
 * } = useInfiniteBooksByTitle({
 *   title: "JavaScript",
 *   maxResults: 20
 * })
 *
 * return (
 *   <>
 *     {data?.pages.map((page) =>
 *       page.items?.map((book) => <BookCard key={book.id} book={book} />)
 *     )}
 *     {hasNextPage && (
 *       <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
 *         {isFetchingNextPage ? "Loading..." : "Load More"}
 *       </button>
 *     )}
 *   </>
 * )
 * ```
 */
export const useInfiniteBooksByTitle = (options: UseInfiniteBooksByTitleOptions) => {
  const { title, maxResults = 20, enabled } = options

  return useInfiniteQuery<VolumeSearchResponse, Error>({
    queryKey: ["books", "title", "infinite", title, maxResults],
    queryFn: async ({ pageParam }) => {
      const result = await bookService.searchByTitle(title, {
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
    enabled: enabled !== false && title.length > 0,
    initialPageParam: 0,
  })
}
