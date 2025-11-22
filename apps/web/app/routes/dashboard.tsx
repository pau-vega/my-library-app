import type { Volume } from "@my-library-app/schemas"

import {
  Button,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Input,
  Spinner,
} from "@my-library-app/ui"
import { FilterIcon, LogOutIcon, MenuIcon, SearchIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { BookCard } from "@/components/book-card"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/context/auth-context"
import { useInfiniteBookSearch } from "@/hooks/use-infinite-book-search"

import type { Route } from "./+types/_index"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Book Search" }, { name: "description", content: "Search for books in your library" }]
}

function DashboardContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [query, setQuery] = useState("")
  const { logout, session } = useAuth()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteBookSearch({
    query,
    maxResults: 20,
    enabled: query.length > 0,
  })

  // Flatten all pages into a single array of books
  const allBooks = data?.pages.flatMap((page) => page.items ?? []) ?? []
  const totalItems = data?.pages[0]?.totalItems ?? 0

  // Intersection Observer for automatic infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(loadMoreRef.current)

    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(searchQuery)
  }

  const handleBookClick = (book: Volume): void => {
    // Open the book's Open Library page in a new tab
    window.open(book.selfLink, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-10 border-b backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Button variant="ghost" size="icon">
            <MenuIcon className="size-5" />
            <span className="sr-only">Categories</span>
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Categorías</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">{session?.user?.email}</span>
              <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                <LogOutIcon className="size-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <FilterIcon className="size-5" />
            <span className="sr-only">Filter</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Search Section */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-5 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search books by title, author, ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner className="size-4" /> : "Search"}
            </Button>
          </div>
        </form>

        {/* Results Section */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-8" />
          </div>
        )}

        {error && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FilterIcon className="size-6" />
              </EmptyMedia>
              <EmptyTitle>Error loading books</EmptyTitle>
              <EmptyDescription>{error.message}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {!isLoading && !error && query && allBooks.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon className="size-6" />
              </EmptyMedia>
              <EmptyTitle>No books found</EmptyTitle>
              <EmptyDescription>Try searching with different keywords</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {!isLoading && !error && allBooks.length > 0 && (
          <>
            <div className="text-muted-foreground mb-4 text-sm">
              Found {totalItems} {totalItems === 1 ? "book" : "books"}
              {allBooks.length < totalItems && ` (showing ${allBooks.length})`}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {allBooks.map((book) => (
                <BookCard key={book.id} book={book} onClick={handleBookClick} />
              ))}
            </div>
            {/* Intersection observer target for infinite scroll */}
            {hasNextPage && (
              <div ref={loadMoreRef} className="flex items-center justify-center py-8">
                {isFetchingNextPage && <Spinner className="size-6" />}
              </div>
            )}
            {/* Load More button as fallback */}
            {hasNextPage && !isFetchingNextPage && (
              <div className="flex items-center justify-center py-4">
                <Button onClick={() => fetchNextPage()} variant="outline">
                  Load More
                </Button>
              </div>
            )}
          </>
        )}

        {!isLoading && !error && !query && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon className="size-6" />
              </EmptyMedia>
              <EmptyTitle>Search for books</EmptyTitle>
              <EmptyDescription>Enter a search query above to find books</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
