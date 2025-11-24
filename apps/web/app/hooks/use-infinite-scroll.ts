import { useEffect, useRef } from "react"

interface UseInfiniteScrollOptions {
  readonly hasNextPage?: boolean
  readonly isFetchingNextPage: boolean
  readonly fetchNextPage: () => void
  readonly threshold?: number
}

/**
 * Hook for implementing infinite scroll with Intersection Observer
 *
 * Automatically triggers `fetchNextPage` when the sentinel element becomes visible.
 *
 * @example
 * ```tsx
 * const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(...)
 * const sentinelRef = useInfiniteScroll({
 *   hasNextPage,
 *   isFetchingNextPage,
 *   fetchNextPage,
 * })
 *
 * return (
 *   <>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     {hasNextPage && <div ref={sentinelRef} />}
 *   </>
 * )
 * ```
 */
export const useInfiniteScroll = (options: UseInfiniteScrollOptions) => {
  const { hasNextPage, isFetchingNextPage, fetchNextPage, threshold = 0.1 } = options
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        // When the sentinel element is visible and we have more pages to fetch
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, threshold])

  return sentinelRef
}



