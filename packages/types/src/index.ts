/**
 * Supported locales for public web and SEO.
 */
export type SupportedLocale = "tr" | "en";

/**
 * Normalized guide content category.
 */
export type GuideCategory = "patch" | "maintenance" | "event" | "news" | "guide" | "general";

/**
 * API guide summary returned to clients.
 */
export type GuideSummaryDto = Readonly<{
  id: string;
  slug: string;
  title: string;
  summary: string;
  locale: SupportedLocale;
  category: GuideCategory;
  tags: readonly string[];
  updatedAt: string;
  isPublished: boolean;
}>;

/**
 * API guide detail.
 */
export type GuideDetailDto = Readonly<
  GuideSummaryDto & {
    bodyMarkdown: string;
  }
>;

/**
 * Scraper job status values.
 */
export type JobStatus = "pending" | "running" | "completed" | "failed";

/**
 * Scraper job record for admin and workers.
 */
export type ScraperJobDto = Readonly<{
  id: string;
  sourceKey: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}>;

/**
 * User role for authorization.
 */
export type UserRole = "admin" | "editor" | "user";

/**
 * Authenticated user payload in JWT.
 */
export type JwtUserPayload = Readonly<{
  sub: string;
  email: string;
  role: UserRole;
}>;
