import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isSupportedLocale } from "@/i18n/locales";

export function generateStaticParams(): { locale: string }[] {
  return [{ locale: "en" }, { locale: "tr" }];
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";
  return {
    alternates: {
      canonical: `${base}/${params.locale}`,
      languages: {
        en: `${base}/en`,
        tr: `${base}/tr`,
        "x-default": `${base}/en`
      }
    }
  };
}

export default async function LocaleLayout(props: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}): Promise<ReactNode> {
  const params = await props.params;
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }
  return <div lang={params.locale}>{props.children}</div>;
}
