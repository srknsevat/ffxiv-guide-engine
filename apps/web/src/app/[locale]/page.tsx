import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { PageShell } from "@ffxiv-guide-engine/ui";
import type { SupportedLocale } from "@ffxiv-guide-engine/types";
import { isSupportedLocale } from "@/i18n/locales";
import { fetchPublishedGuides } from "@/lib/fetch-guides";

export default async function HomePage(props: {
  params: Promise<{ locale: string }>;
}): Promise<ReactNode> {
  const params = await props.params;
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }
  const locale = params.locale as SupportedLocale;
  const guides = await fetchPublishedGuides(locale);
  return (
    <PageShell title={locale === "tr" ? "Rehberler" : "Guides"}>
      <ul>
        {guides.map((g) => (
          <li key={g.id}>
            <Link href={`/${locale}/guides/${g.slug}`}>{g.title}</Link>
            <span> — {g.category}</span>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
