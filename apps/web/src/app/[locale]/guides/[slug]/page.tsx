import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@ffxiv-guide-engine/seo";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryPill, GuideCard, PageShell, SectionHeader, StatusBadge } from "@ffxiv-guide-engine/ui";
import type { GuideCategory, GuideDetailDto, GuideSummaryDto, SupportedLocale } from "@ffxiv-guide-engine/types";
import { isSupportedLocale } from "@/i18n/locales";
import { fetchGuideBySlug, fetchPublishedGuides } from "@/lib/fetch-guides";

const CATEGORY_LABELS: Readonly<Record<GuideCategory, string>> = {
  patch: "Patch",
  maintenance: "Maintenance",
  event: "Event",
  news: "News",
  guide: "Guide",
  general: "General"
};

type SourceMeta = Readonly<{
  source?: string;
  published?: string;
  body: string;
}>;

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function parseSourceMeta(guide: GuideDetailDto): SourceMeta {
  const lines = guide.bodyMarkdown.split("\n");
  const sourceLine = lines.find((line) => line.startsWith("Source: "));
  const publishedLine = lines.find((line) => line.startsWith("Published: "));
  const body = lines
    .filter((line) => !line.startsWith("Source: ") && !line.startsWith("Published: "))
    .join("\n")
    .trim();
  return {
    source: sourceLine?.replace("Source: ", "").trim(),
    published: publishedLine?.replace("Published: ", "").trim(),
    body: body.length > 0 ? body : guide.bodyMarkdown
  };
}

function renderArticleBody(markdown: string): ReactNode {
  const paragraphs = markdown
    .split(/\n{2,}/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return paragraphs.map((paragraph) => <p key={paragraph}>{paragraph.replace(/^##\s*/, "")}</p>);
}

function getRelatedGuides(
  guides: readonly GuideSummaryDto[],
  guide: GuideDetailDto
): GuideSummaryDto[] {
  return guides
    .filter((item) => item.id !== guide.id && item.category === guide.category)
    .slice(0, 3);
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  if (!isSupportedLocale(params.locale)) {
    return {};
  }
  const locale = params.locale as SupportedLocale;
  const guide = await fetchGuideBySlug(params.slug, locale);
  if (!guide) {
    return { title: "Not found" };
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";
  return {
    title: guide.title,
    description: guide.summary,
    alternates: {
      canonical: `${base}/${locale}/guides/${guide.slug}`,
      languages: {
        en: `${base}/en/guides/${guide.slug}`,
        tr: `${base}/tr/guides/${guide.slug}`,
        "x-default": `${base}/en/guides/${guide.slug}`
      }
    }
  };
}

export default async function GuidePage(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<ReactNode> {
  const params = await props.params;
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }
  const locale = params.locale as SupportedLocale;
  const guide = await fetchGuideBySlug(params.slug, locale);
  if (!guide) {
    notFound();
  }
  const guides = await fetchPublishedGuides(locale);
  const relatedGuides = getRelatedGuides(guides, guide);
  const sourceMeta = parseSourceMeta(guide);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";
  const url = `${base}/${locale}/guides/${guide.slug}`;
  const articleLd = buildArticleJsonLd({
    locale,
    title: guide.title,
    description: guide.summary,
    url,
    dateModified: guide.updatedAt
  });
  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: locale === "tr" ? "Ana sayfa" : "Home", url: `${base}/${locale}` },
    { name: guide.title, url }
  ]);
  return (
    <PageShell
      eyebrow="Guide dossier"
      title={guide.title}
      subtitle={guide.summary}
      actions={
        <Link className="button-secondary" href={`/${locale}`}>
          Back to command center
        </Link>
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <section className="hero-panel">
        <div className="hero-content">
          <p className="eyebrow">Intel packet</p>
          <h2>{guide.title}</h2>
          <p>{guide.summary}</p>
          <div className="hero-actions">
            <CategoryPill label={CATEGORY_LABELS[guide.category]} />
            <StatusBadge tone="success">Published</StatusBadge>
            {guide.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <strong>{formatDate(guide.updatedAt).split(",")[0]}</strong>
            <span>Last updated</span>
          </div>
          <div className="hero-stat">
            <strong>{guide.category}</strong>
            <span>Category</span>
          </div>
        </div>
      </section>
      <div className="article-layout">
        <article className="content-panel article-body">{renderArticleBody(sourceMeta.body)}</article>
        <aside className="source-panel">
          <dl>
            <div>
              <dt>Source</dt>
              <dd>
                {sourceMeta.source ? (
                  <a className="button-secondary" href={sourceMeta.source}>
                    Official Lodestone
                  </a>
                ) : (
                  "Internal guide"
                )}
              </dd>
            </div>
            <div>
              <dt>Published</dt>
              <dd>{sourceMeta.published ?? formatDate(guide.updatedAt)}</dd>
            </div>
            <div>
              <dt>Tags</dt>
              <dd className="tag-row">
                {guide.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
      {relatedGuides.length > 0 ? (
        <section>
          <SectionHeader
            eyebrow="Keep exploring"
            title="Related intel"
            description="More entries from the same category."
          />
          <div className="guide-grid">
            {relatedGuides.map((item) => (
              <GuideCard
                key={item.id}
                href={`/${locale}/guides/${item.slug}`}
                title={item.title}
                summary={item.summary}
                category={CATEGORY_LABELS[item.category]}
                tags={item.tags}
                updatedAt={formatDate(item.updatedAt)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
