import { searchBookSortOptionsSchema, type SearchSort } from "@my-library-app/schemas"
import {
  Button,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@my-library-app/ui"
import { ArrowDownUpIcon, FilterIcon, SearchIcon } from "lucide-react"
import { useState } from "react"
import { redirect, useSearchParams } from "react-router"

import { BookCard } from "@/components/book-card"
import { Navigation } from "@/components/layout/navigation"
import { useInfiniteBookSearch } from "@/hooks/use-infinite-book-search"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { getUser } from "@/services/auth-service"
import { type SearchField, type Volume } from "@/services/book-service"

import type { Route } from "./+types/_index"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Book Search" }, { name: "description", content: "Search for books in your library" }]
}

export async function clientLoader() {
  const result = await getUser()
  if (!result.ok) return redirect("/login")
  return { user: result.value }
}

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Read from URL params (source of truth)
  const query = searchParams.get("q") ?? ""
  const filterField = (searchParams.get("field") as SearchField | null) ?? undefined
  const sort = (searchParams.get("sort") as SearchSort | null) ?? undefined

  // Local state for the input field (before submission)
  const [searchQuery, setSearchQuery] = useState(query)

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteBookSearch({
    query,
    field: filterField,
    sort,
    maxResults: 20,
    enabled: query.length > 0,
  })

  // Flatten all pages into a single array of books
  // No need to filter by language - the API already returns English books only
  const allBooks = data?.pages.flatMap((page) => page.items ?? []) ?? []
  const totalItems = data?.pages[0]?.totalItems ?? 0

  // Infinite scroll hook - automatically fetches next page when sentinel is visible
  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Update URL params
    const newParams = new URLSearchParams(searchParams)
    if (searchQuery) {
      newParams.set("q", searchQuery)
    } else {
      newParams.delete("q")
    }
    if (filterField) {
      newParams.set("field", filterField)
    } else {
      newParams.delete("field")
    }
    if (sort) {
      newParams.set("sort", sort)
    } else {
      newParams.delete("sort")
    }
    setSearchParams(newParams, { replace: true })
  }

  const handleFilterChange = (value: string) => {
    const field = value === "all" ? undefined : (value as SearchField)

    // Update URL params immediately when filter changes
    const newParams = new URLSearchParams(searchParams)
    if (field) {
      newParams.set("field", field)
    } else {
      newParams.delete("field")
    }
    setSearchParams(newParams, { replace: true })
  }

  const handleSortChange = (value: string) => {
    const sortValue = value === "none" ? undefined : (value as SearchSort)

    // Update URL params immediately when sort changes
    const newParams = new URLSearchParams(searchParams)
    if (sortValue) {
      newParams.set("sort", sortValue)
    } else {
      newParams.delete("sort")
    }
    setSearchParams(newParams, { replace: true })
  }

  const handleBookClick = (book: Volume): void => {
    // Open the book's Open Library page in a new tab
    window.open(book.selfLink, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <Navigation />

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
            <Select value={filterField ?? "all"} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-10 sm:w-[140px]">
                <FilterIcon className="size-4 sm:hidden" />
                <span className="hidden sm:inline">
                  <SelectValue placeholder="Filter by" />
                </span>
                <span className="sr-only sm:not-sr-only sm:hidden">Filter by</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="publisher">Publisher</SelectItem>
                <SelectItem value="subject">Subject</SelectItem>
                <SelectItem value="isbn">ISBN</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort ?? "none"} onValueChange={handleSortChange}>
              <SelectTrigger className="w-10 sm:w-[140px]">
                <ArrowDownUpIcon className="size-4 sm:hidden" />
                <span className="hidden sm:inline">
                  <SelectValue placeholder="Sort by" />
                </span>
                <span className="sr-only sm:not-sr-only sm:hidden">Sort by</span>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sort by</SelectLabel>
                  <SelectItem value="none">Relevance</SelectItem>
                  {searchBookSortOptionsSchema.options.map((option) => (
                    <SelectItem key={option} value={option} className="capitalize">
                      {option.replace(/_/g, " ").charAt(0).toUpperCase() + option.replace(/_/g, " ").slice(1)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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
              <div ref={sentinelRef} className="flex items-center justify-center py-8">
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
