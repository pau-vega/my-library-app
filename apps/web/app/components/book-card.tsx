import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@my-library-app/ui"

import type { Volume } from "@my-library-app/schemas"

type BookCardProps = {
  readonly book: Volume
  readonly onClick?: (book: Volume) => void
}

/**
 * Book card component displaying book information in a compact card format
 */
export const BookCard = ({ book, onClick }: BookCardProps) => {
  const volumeInfo = book.volumeInfo
  const thumbnail = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail
  const imageUrl = thumbnail ? thumbnail.replace("http://", "https://") : "/placeholder.png"
  const authors = volumeInfo.authors?.join(", ") || "Unknown Author"
  const title = volumeInfo.title || "Untitled"
  const subtitle = volumeInfo.subtitle
  const publishedDate = volumeInfo.publishedDate
  const categories = volumeInfo.categories?.slice(0, 2).join(", ")

  const handleClick = (): void => {
    if (onClick) {
      onClick(book)
    }
  }

  return (
    <Card
      className="overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
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
      <div className="bg-muted aspect-3/4 w-full overflow-hidden">
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
      <CardHeader className="pt-2 pb-1.5">
        <CardTitle className="line-clamp-2 text-sm leading-tight">{title}</CardTitle>
        {subtitle && <CardDescription className="line-clamp-1 text-[10px]">{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-0.5 pt-0 pb-2">
        <div className="text-muted-foreground text-xs">
          <div className="line-clamp-1">{authors}</div>
          {categories && <div className="line-clamp-1 text-[10px]">{categories}</div>}
          {publishedDate && <div className="text-[10px]">{publishedDate.split("-")[0]}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

