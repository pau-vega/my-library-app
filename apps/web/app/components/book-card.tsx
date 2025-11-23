import { Card, CardContent, CardHeader, CardTitle } from "@my-library-app/ui"

import type { Volume } from "@/services/book-service"

type BookCardProps = {
  readonly book: Volume
  readonly onClick?: (book: Volume) => void
}

/**
 * Book card component displaying book information in a compact card format
 */
export const BookCard = ({ book, onClick }: BookCardProps) => {
  console.log(book)
  const volumeInfo = book.volumeInfo
  const thumbnail = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail
  const imageUrl = thumbnail ? thumbnail.replace("http://", "https://") : "/placeholder.png"
  const authors = volumeInfo.authors?.join(", ") || "Unknown Author"
  const title = volumeInfo.title || "Untitled"
  const publishedDate = volumeInfo.publishedDate
  const categories = volumeInfo.categories?.slice(0, 2).join(", ")

  const handleClick = (): void => {
    if (onClick) {
      onClick(book)
    }
  }

  return (
    <Card
      className="cursor-pointer gap-1 overflow-hidden rounded-none border-0 p-0 shadow-none"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div className="bg-muted aspect-3/5 w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const target = e.currentTarget
            if (target.src !== "/placeholder.png") {
              target.src = "/placeholder.png"
            }
          }}
        />
      </div>
      <CardHeader className="px-2 py-2">
        <CardTitle className="line-clamp-3 text-center text-xs leading-tight font-normal uppercase">
          {title}
          <span className="mx-1">({publishedDate})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0.5 pt-0 pb-2">
        <div className="text-muted-foreground text-xs">
          <div className="line-clamp-1 font-semibold">{authors}</div>
          {categories && <div className="line-clamp-1 text-[10px]">{categories}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
