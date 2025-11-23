import { z } from "zod";

export const searchBookSortOptionsSchema = z.enum({
  editions: "editions",
  old: "old",
  new: "new",
  rating: "rating",
  rating_asc: "rating asc",
  rating_desc: "rating desc",
  title: "title",
  scans: "scans",
});

export const searchBookYearRangeOptionsSchema = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
});

export const searchBookLanguageOptionsSchema = z.enum({
  ENGLISH: "eng",
  SPANISH: "spa",
  CATALAN: "cat",
  MULTIPLE_LANGUAGES: "mul",
});

export const iso6391LanguageOptionsSchema = z.enum(["en", "es", "cat"]);

export const searchBookFieldsSchema = z.enum([
  "key",
  "redirects",
  "title",
  "subtitle",
  "alternative_title",
  "alternative_subtitle",
  "cover_i",
  "ebook_access",
  "edition_count",
  "edition_key",
  "format",
  "by_statement",
  "publish_date",
  //"lccn",
  //"ia",
  //"oclc",
  "isbn",
  //"contributor",
  //"publish_place",
  "publisher",
  "first_sentence",
  "author_key",
  "author_name",
  "author_alternative_name",
  "subject",
  "person",
  "place",
  "time",
  //"has_fulltext",
  //"title_suggest",
  "publish_year",
  "language",
  "number_of_pages_median",
  //"ia_count",
  //"publisher_facet",
  //"author_facet",
  "first_publish_year",
  "ratings_count",
  //"readinglog_count",
  //"want_to_read_count",
  //"currently_reading_count",
  //"already_read_count",
  "subject_key",
  "person_key",
  "place_key",
  "time_key",
  //"lcc",
  //"ddc",
  //"lcc_sort",
  //"ddc_sort",
]);

export const searchBookQueryOptionsSchema = z.object({
  title: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  place: z.string().min(1).optional(),
  person: z.string().min(1).optional(),
  /**
   * Language of the book, this will exclude books that are not in the language
   */
  language: searchBookLanguageOptionsSchema.optional(),
  publisher: z.string().min(1).optional(),
  publish_year: z.number().int().nonnegative().optional(),
  first_publish_year: searchBookYearRangeOptionsSchema.optional(),
  title_suggest: z.string().min(1).optional(),
});

export const searchBookRequestSchema = z.object({
  query: searchBookQueryOptionsSchema,
  fields: searchBookFieldsSchema.array().optional(),
  sort: searchBookSortOptionsSchema.optional(),
  /**
   * Language of the books, this will give preference to books in the language, but it would not exclude books that are not in the language
   */
  lang: iso6391LanguageOptionsSchema.optional(),
  offset: z.number().int().nonnegative().optional(),
  limit: z.number().int().positive().max(40).optional(),
});

export const searchBookResponseSchema = z.object({
  num_found: z.number().int().nonnegative(),
  start: z.number().int().nonnegative(),
  q: z.string().min(1),
  documentation_url: z.url(),
  docs: z.array(
    z.object({
      author_key: z.array(z.string()).optional(),
      author_name: z.array(z.string()).optional(),
      cover_i: z.number().int().nonnegative().optional(),
      edition_count: z.number().int().nonnegative().optional(),
      first_publish_year: z.number().int().optional(),
      key: z.string(),
      language: z.array(searchBookLanguageOptionsSchema.or(z.string())).optional(),
      isbn: z.array(z.string()).optional(),
      number_of_pages_median: z.number().optional(),
      publisher: z.array(z.string()).optional(),
      subject: z.array(z.string()).optional(),
      title: z.string(),
    }),
  ),
});

export const imageLinksSchema = z.object({
  thumbnail: z.url().optional(),
  smallThumbnail: z.url().optional(),
});

export const industryIdentifierSchema = z.object({
  type: z.enum(["ISBN_10", "ISBN_13"]),
  identifier: z.string(),
});

export const bookSchema = z.object({
  id: z.string(),
  selfLink: z.url(),
  title: z.string(),
  authors: z.array(z.string()),
  publishedDate: z.string(),
  categories: z.array(z.string()),
  publisher: z.string().optional(),
  language: searchBookLanguageOptionsSchema.or(z.string()).optional(),
  pageCount: z.number().int().nonnegative().optional(),
  imageLinks: imageLinksSchema.optional(),
  industryIdentifiers: industryIdentifierSchema.array().optional(),
});

/**
 * Type exports inferred from schemas
 */
export type SearchBookField = z.infer<typeof searchBookFieldsSchema>;
export type SearchSort = z.infer<typeof searchBookSortOptionsSchema>;
export type SearchBookLanguage = z.infer<typeof searchBookLanguageOptionsSchema>;
export type SearchBookYearRange = z.infer<typeof searchBookYearRangeOptionsSchema>;
export type SearchBookRequest = z.infer<typeof searchBookRequestSchema>;
export type SearchBookResponse = z.infer<typeof searchBookResponseSchema>;
export type Book = z.infer<typeof bookSchema>;
