import { z } from "zod";

/**
 * Search field keywords for Open Library API
 */
export const searchFieldSchema = z.enum(["title", "author", "publisher", "subject", "isbn"]);

/**
 * Sort options for Open Library API
 */
export const searchSortSchema = z.enum(["relevance", "new", "old", "random"]);

/**
 * Industry identifier schema (ISBN, ISSN, etc.)
 */
export const industryIdentifierSchema = z.object({
  type: z.string(),
  identifier: z.string(),
});

/**
 * Image links schema for book covers
 */
export const imageLinksSchema = z.object({
  thumbnail: z.string().url().optional(),
  smallThumbnail: z.string().url().optional(),
});

/**
 * Volume information schema containing book details
 */
export const volumeInfoSchema = z.object({
  title: z.string(),
  authors: z.array(z.string()).optional(),
  publisher: z.string().optional(),
  publishedDate: z.string(),
  description: z.string().optional(),
  pageCount: z.number().int().nonnegative().optional(),
  categories: z.array(z.string()).optional(),
  imageLinks: imageLinksSchema.optional(),
  language: z.string().optional(),
  previewLink: z.string().url().optional(),
  infoLink: z.string().url().optional(),
  industryIdentifiers: z.array(industryIdentifierSchema).optional(),
});

/**
 * Volume schema representing a single book
 */
export const volumeSchema = z.object({
  id: z.string(),
  volumeInfo: volumeInfoSchema,
  selfLink: z.string().url(),
});

/**
 * Open Library search document schema
 */
export const openLibraryDocSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  author_name: z.array(z.string()).optional(),
  author_key: z.array(z.string()).optional(),
  first_publish_year: z.number().int().optional(),
  isbn: z.array(z.string()).optional(),
  cover_i: z.number().int().optional(),
  cover_edition_key: z.string().optional(),
  subject: z.array(z.string()).optional(),
  publisher: z.array(z.string()).optional(),
  publish_year: z.array(z.number().int()).optional(),
  language: z.array(z.string()).optional(),
  edition_count: z.number().int().nonnegative().optional(),
  number_of_pages_median: z.number().int().nonnegative().optional(),
  has_fulltext: z.boolean().optional(),
  public_scan_b: z.boolean().optional(),
});

/**
 * Open Library search response schema
 */
export const openLibrarySearchResponseSchema = z.object({
  numFound: z.number().int().nonnegative(),
  start: z.number().int().nonnegative(),
  docs: z.array(openLibraryDocSchema),
});

/**
 * Volume search response schema (transformed from Open Library API)
 */
export const volumeSearchResponseSchema = z.object({
  kind: z.string(),
  totalItems: z.number().int().nonnegative(),
  items: z.array(volumeSchema).optional(),
});

/**
 * Search options schema for book queries
 */
export const searchOptionsSchema = z.object({
  query: z.string().min(1),
  field: searchFieldSchema.optional(),
  sort: searchSortSchema.optional(),
  maxResults: z.number().int().positive().max(40).optional(),
  startIndex: z.number().int().nonnegative().optional(),
});

/**
 * Type exports inferred from schemas
 */
export type SearchField = z.infer<typeof searchFieldSchema>;
export type SearchSort = z.infer<typeof searchSortSchema>;
export type IndustryIdentifier = z.infer<typeof industryIdentifierSchema>;
export type ImageLinks = z.infer<typeof imageLinksSchema>;
export type VolumeInfo = z.infer<typeof volumeInfoSchema>;
export type Volume = z.infer<typeof volumeSchema>;
export type VolumeSearchResponse = z.infer<typeof volumeSearchResponseSchema>;
export type SearchOptions = z.infer<typeof searchOptionsSchema>;
export type OpenLibraryDoc = z.infer<typeof openLibraryDocSchema>;
export type OpenLibrarySearchResponse = z.infer<typeof openLibrarySearchResponseSchema>;
