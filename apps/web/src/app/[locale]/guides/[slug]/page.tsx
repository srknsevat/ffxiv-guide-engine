import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@ffxiv-guide-engine/seo";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { PageShell } from "@ffxiv-guide-engine/ui";
import type { SupportedLocale } from "@ffxiv-guide-engine/types";
import { isSupportedLocale } from "@/i18n/locales";
import { fetchGuideBySlug } from "@/lib/fetch-guides";

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
    <PageShell title={guide.title}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <p>{guide.summary}</p>
      <p>
        Category: {guide.category}
        {guide.tags.length > 0 ? ` | Tags: ${guide.tags.join(", ")}` : ""}
      </p>
      <article>
        <pre style={{ whiteSpace: "pre-wrap" }}>{guide.bodyMarkdown}</pre>
      </article>
    </PageShell>
  );
}
