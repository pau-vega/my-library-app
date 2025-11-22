# @my-library-app/schemas

Zod validation schemas for the library app, providing type-safe validation for the Google Books API.

## Features

- **Book Schemas**: Comprehensive schemas for Google Books API responses
- **Search Validation**: Schemas for validating search queries and options
- **Type Safety**: TypeScript types inferred from Zod schemas
- **Runtime Validation**: Validate API responses at runtime to catch data inconsistencies

## Installation

This package is part of the workspace and is automatically linked.

```json
{
  "dependencies": {
    "@my-library-app/schemas": "workspace:*"
  }
}
```

## Usage

### Importing Schemas and Types

```typescript
import {
  volumeSearchResponseSchema,
  searchOptionsSchema,
  type VolumeSearchResponse,
  type SearchOptions,
  type Volume,
  type VolumeInfo,
} from "@my-library-app/schemas";
```

### Validating API Responses

```typescript
import { volumeSearchResponseSchema } from "@my-library-app/schemas";

const response = await fetch(apiUrl);
const rawData = await response.json();

const parseResult = volumeSearchResponseSchema.safeParse(rawData);

if (parseResult.success) {
  // Data is valid and type-safe
  const books = parseResult.data.items;
  console.log(`Found ${parseResult.data.totalItems} books`);
} else {
  // Handle validation error
  console.error("Invalid API response:", parseResult.error);
}
```

### Validating Search Options

```typescript
import { searchOptionsSchema } from "@my-library-app/schemas";

const options = {
  query: "TypeScript",
  field: "intitle",
  maxResults: 10,
};

const result = searchOptionsSchema.safeParse(options);

if (result.success) {
  // Options are valid
  console.log("Valid search options:", result.data);
}
```

## Available Schemas

### Search Schemas

- `searchFieldSchema` - Enum for search field keywords (intitle, inauthor, etc.)
- `searchOptionsSchema` - Schema for search query options

### Book Data Schemas

- `volumeInfoSchema` - Detailed information about a book
- `volumeSchema` - Complete volume/book object
- `volumeSearchResponseSchema` - Google Books API search response
- `imageLinksSchema` - Book cover image URLs
- `industryIdentifierSchema` - ISBN, ISSN, etc.

## Available Types

All types are inferred from the Zod schemas:

```typescript
type SearchField = z.infer<typeof searchFieldSchema>;
type SearchOptions = z.infer<typeof searchOptionsSchema>;
type VolumeInfo = z.infer<typeof volumeInfoSchema>;
type Volume = z.infer<typeof volumeSchema>;
type VolumeSearchResponse = z.infer<typeof volumeSearchResponseSchema>;
type ImageLinks = z.infer<typeof imageLinksSchema>;
type IndustryIdentifier = z.infer<typeof industryIdentifierSchema>;
```

## Schema Validation Rules

### Search Options

- `query`: Non-empty string (required)
- `field`: One of the predefined search fields (optional)
- `maxResults`: Positive integer, max 40 (optional)
- `startIndex`: Non-negative integer (optional)

### Volume Info

- `title`: Required string
- `authors`: Optional array of strings
- `pageCount`: Optional positive integer
- `imageLinks.thumbnail`: Optional URL string
- `imageLinks.smallThumbnail`: Optional URL string

### Volume Search Response

- `kind`: Required string
- `totalItems`: Non-negative integer
- `items`: Optional array of volumes

## Example: Complete Flow

```typescript
import {
  searchOptionsSchema,
  volumeSearchResponseSchema,
  type VolumeSearchResponse,
} from "@my-library-app/schemas";

async function searchBooks(query: string): Promise<VolumeSearchResponse> {
  // Validate input
  const options = searchOptionsSchema.parse({
    query,
    maxResults: 10,
  });

  // Make API request
  const url = `https://www.googleapis.com/books/v1/volumes?q=${options.query}`;
  const response = await fetch(url);
  const rawData = await response.json();

  // Validate response
  return volumeSearchResponseSchema.parse(rawData);
}
```

## Development

### Building

```bash
pnpm build
```

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
```
