import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  CategoryPill,
  GuideCard,
  HeroSection,
  MetricCard,
  PageShell,
  SectionHeader
} from "@ffxiv-guide-engine/ui";
import type { GuideCategory, GuideSummaryDto, SupportedLocale } from "@ffxiv-guide-engine/types";
import { isSupportedLocale } from "@/i18n/locales";
import { fetchPublishedGuides } from "@/lib/fetch-guides";

type CategorySummary = Readonly<{
  category: GuideCategory;
  label: string;
  description: string;
  count: number;
}>;

const CATEGORY_COPY: Readonly<Record<GuideCategory, Readonly<{ en: string; tr: string; description: string }>>> = {
  patch: {
    en: "Patch",
    tr: "Yama",
    description: "Track balance changes, release notes, and new systems."
  },
  maintenance: {
    en: "Maintenance",
    tr: "Bakım",
    description: "Know downtime windows before planning your session."
  },
  event: {
    en: "Events",
    tr: "Etkinlikler",
    description: "Seasonal events, campaigns, and time-limited rewards."
  },
  news: {
    en: "News",
    tr: "Haberler",
    description: "Official updates that can change your next login."
  },
  guide: {
    en: "Guides",
    tr: "Rehberler",
    description: "Evergreen explainers for progression and systems."
  },
  general: {
    en: "General",
    tr: "Genel",
    description: "Everything else worth keeping in your adventurer log."
  }
};

function countGuidesByCategory(guides: readonly GuideSummaryDto[], category: GuideCategory): number {
  return guides.filter((guide) => guide.category === category).length;
}

function buildCategorySummaries(
  guides: readonly GuideSummaryDto[],
  locale: SupportedLocale
): CategorySummary[] {
  const categories: GuideCategory[] = ["patch", "maintenance", "event", "guide", "news"];
  return categories.map((category) => ({
    category,
    label: CATEGORY_COPY[category][locale],
    description: CATEGORY_COPY[category].description,
    count: countGuidesByCategory(guides, category)
  }));
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

export default async function HomePage(props: {
  params: Promise<{ locale: string }>;
}): Promise<ReactNode> {
  const params = await props.params;
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }
  const locale = params.locale as SupportedLocale;
  const guides = await fetchPublishedGuides(locale);
  const latestGuides = guides.slice(0, 6);
  const featuredGuide = guides[0];
  const categorySummaries = buildCategorySummaries(guides, locale);
  const totalTags = new Set(guides.flatMap((guide) => guide.tags)).size;
  return (
    <PageShell
      eyebrow="FFXIV Guide Engine"
      title={locale === "tr" ? "Aether Haritası" : "Aether Command Center"}
      subtitle={
        locale === "tr"
          ? "Resmi haberleri, bakım notlarını ve yayınlanmış rehberleri tek ekranda takip et."
          : "Track official updates, guides, maintenance windows, and adventurer intel from one portal."
      }
      actions={
        <>
          <Link className="button" href={`/${locale}#latest`}>
            {locale === "tr" ? "Son içerikler" : "Latest intel"}
          </Link>
          <Link className="button-secondary" href={`/${locale === "tr" ? "en" : "tr"}`}>
            {locale === "tr" ? "English" : "Türkçe"}
          </Link>
        </>
      }
    >
      <HeroSection
        eyebrow={locale === "tr" ? "Oyundan çıkmadan hazırlan" : "Stay ready between queues"}
        title={locale === "tr" ? "Eorzea için görev masan." : "Your tactical board for Eorzea."}
        description={
          locale === "tr"
            ? "Patch, bakım, etkinlik ve rehber akışlarını oyuncu gözüyle düzenleyen koyu temalı bir merkez."
            : "A dark fantasy hub that turns official updates and guides into a readable MMO command center."
        }
        actions={
          <>
            <Link className="button" href={`/${locale}#categories`}>
              {locale === "tr" ? "Kategorileri keşfet" : "Explore categories"}
            </Link>
            {featuredGuide ? (
              <Link className="button-secondary" href={`/${locale}/guides/${featuredGuide.slug}`}>
                {locale === "tr" ? "Öne çıkan rehber" : "Open featured"}
              </Link>
            ) : null}
          </>
        }
        stats={[
          { label: locale === "tr" ? "Yayınlanmış içerik" : "Published entries", value: String(guides.length) },
          { label: locale === "tr" ? "Kategori" : "Categories", value: String(categorySummaries.length) },
          { label: locale === "tr" ? "Etiket" : "Tags", value: String(totalTags) }
        ]}
      />
      <section id="categories">
        <SectionHeader
          eyebrow={locale === "tr" ? "Keşif rotaları" : "Discovery lanes"}
          title={locale === "tr" ? "Ne arıyorsun, Warrior of Light?" : "What are you tracking, Warrior of Light?"}
          description={
            locale === "tr"
              ? "İçerikleri oyundaki ihtiyacına göre ayır: bakım takibi, patch okuma, etkinlik avı veya rehber."
              : "Jump into the type of intel you need before your next duty, raid night, or market board check."
          }
        />
        <div className="category-grid">
          {categorySummaries.map((summary) => (
            <article className="guide-card" key={summary.category}>
              <CategoryPill label={summary.label} />
              <h3>{summary.count} {locale === "tr" ? "kayıt" : "entries"}</h3>
              <p>{summary.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="latest">
        <SectionHeader
          eyebrow={locale === "tr" ? "Canlı panodan" : "From the live board"}
          title={locale === "tr" ? "Son yayınlananlar" : "Latest published intel"}
          description={
            locale === "tr"
              ? "Admin tarafından onaylanan içerikler burada oyuncuya hazır şekilde görünür."
              : "Approved entries appear here as polished cards, ready to open without leaving the portal."
          }
        />
        {latestGuides.length > 0 ? (
          <div className="guide-grid">
            {latestGuides.map((guide) => (
              <GuideCard
                key={guide.id}
                href={`/${locale}/guides/${guide.slug}`}
                title={guide.title}
                summary={guide.summary}
                category={CATEGORY_COPY[guide.category][locale]}
                tags={guide.tags}
                updatedAt={formatDate(guide.updatedAt)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            {locale === "tr"
              ? "Henüz yayınlanmış içerik yok. Admin panelinden draft içerikleri yayınlayınca burası dolacak."
              : "No published entries yet. Publish drafts from the admin console to populate this board."}
          </div>
        )}
      </section>
      <section>
        <SectionHeader
          eyebrow={locale === "tr" ? "Portal hedefi" : "Portal promise"}
          title={locale === "tr" ? "Tek sekmede oyun zekası" : "Game intelligence in one tab"}
          description={
            locale === "tr"
              ? "Bir sonraki aşamada job rehberleri, rota takibi, patch notu özetleri ve favori içerikler eklenebilir."
              : "Next layers can add job guides, route tracking, patch summaries, and saved favorites."
          }
        />
        <div className="metric-grid">
          <MetricCard label="SEO" value="Live" detail="Schema, sitemap, hreflang" tone="gold" />
          <MetricCard label="Scraper" value="On" detail="Official Lodestone feed" tone="blue" />
          <MetricCard label="Review" value="Draft" detail="Admin approval before publish" tone="violet" />
          <MetricCard label="Locale" value="EN/TR" detail="Ready for multilingual content" tone="blue" />
        </div>
      </section>
    </PageShell>
  );
}
