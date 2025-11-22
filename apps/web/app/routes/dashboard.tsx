import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Input,
  Spinner,
} from "@my-library-app/ui"
import { FilterIcon, MenuIcon, SearchIcon } from "lucide-react"
import { useState } from "react"

import { useBookSearch } from "@/hooks/use-book-search"

import type { Route } from "./+types/_index"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Book Search" }, { name: "description", content: "Search for books in your library" }]
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [query, setQuery] = useState("")

  const { data, isLoading, error } = useBookSearch({
    query,
    maxResults: 20,
    enabled: query.length > 0,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(searchQuery)
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
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Categorías</span>
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

        {!isLoading && !error && query && data && data.items && data.items.length === 0 && (
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

        {!isLoading && !error && data && data.items && data.items.length > 0 && (
          <>
            <div className="text-muted-foreground mb-4 text-sm">
              Found {data.totalItems} {data.totalItems === 1 ? "book" : "books"}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.items.map((book) => {
                const volumeInfo = book.volumeInfo
                const thumbnail = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail
                const authors = volumeInfo.authors?.join(", ") || "Unknown Author"
                const title = volumeInfo.title || "Untitled"
                const subtitle = volumeInfo.subtitle
                const publishedDate = volumeInfo.publishedDate
                const categories = volumeInfo.categories?.slice(0, 2).join(", ")

                return (
                  <Card key={book.id} className="overflow-hidden">
                    {thumbnail && (
                      <div className="bg-muted aspect-3/4 w-full overflow-hidden">
                        <img
                          src={thumbnail.replace("http://", "https://")}
                          alt={title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-2 text-base">{title}</CardTitle>
                      {subtitle && <CardDescription className="line-clamp-1 text-xs">{subtitle}</CardDescription>}
                    </CardHeader>
                    <CardContent className="space-y-1 pt-0">
                      <div className="text-muted-foreground text-sm">
                        <div className="line-clamp-1">{authors}</div>
                        {categories && <div className="line-clamp-1 text-xs">{categories}</div>}
                        {publishedDate && <div className="text-xs">{publishedDate.split("-")[0]}</div>}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
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
