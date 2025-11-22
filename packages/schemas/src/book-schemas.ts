import { z } from "zod";

/**
 * Search field keywords for Google Books API
 */
export const searchFieldSchema = z.enum(["intitle", "inauthor", "inpublisher", "subject", "isbn", "lccn", "oclc"]);

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
  subtitle: z.string().optional(),
  authors: z.array(z.string()).optional(),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
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
 * Volume search response schema from Google Books API
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
  maxResults: z.number().int().positive().max(40).optional(),
  startIndex: z.number().int().nonnegative().optional(),
});

/**
 * Type exports inferred from schemas
 */
export type SearchField = z.infer<typeof searchFieldSchema>;
export type IndustryIdentifier = z.infer<typeof industryIdentifierSchema>;
export type ImageLinks = z.infer<typeof imageLinksSchema>;
export type VolumeInfo = z.infer<typeof volumeInfoSchema>;
export type Volume = z.infer<typeof volumeSchema>;
export type VolumeSearchResponse = z.infer<typeof volumeSearchResponseSchema>;
export type SearchOptions = z.infer<typeof searchOptionsSchema>;
