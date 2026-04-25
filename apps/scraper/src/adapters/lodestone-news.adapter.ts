import type { GuideCategory } from "@ffxiv-guide-engine/types";
import type { ScraperEnv } from "../config/read-env";
import { executeWithRetry } from "../utils/execute-with-retry";
import { fetchTextWithTimeout } from "../utils/fetch-text-with-timeout";
import type { NormalizedGuide } from "./normalized-guide";
import type { SourceAdapter } from "./source-adapter";

const LODESTONE_NEWS_RSS_URL =
  "https://na.finalfantasyxiv.com/lodestone/news/news.xml";

type LodestoneItem = Readonly<{
  title: string;
  link: string;
  description: string;
  pubDate: string;
}>;

type Classification = Readonly<{
  category: GuideCategory;
  tags: readonly string[];
}>;

function stripCdata(value: string): string {
  return value
    .replace("<![CDATA[", "")
    .replace("]]>", "")
    .trim();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function sanitizeText(value: string): string {
  return decodeHtmlEntities(stripCdata(value).replace(/<[^>]+>/g, "")).trim();
}

function extractTagValue(xml: string, tagName: string): string | null {
  const match = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`));
  return match ? sanitizeText(match[1]) : null;
}

function extractAlternateLink(xml: string): string | null {
  const match = xml.match(/<link[^>]+rel="alternate"[^>]+href="([^"]+)"[^>]*>/);
  return match ? stripCdata(match[1]) : null;
}

function createSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function buildUniqueTags(tags: readonly string[]): readonly string[] {
  return Array.from(new Set(tags.filter((tag) => tag.length > 0)));
}

export function classifyLodestoneItem(item: LodestoneItem): Classification {
  const text = `${item.title} ${item.description}`.toLowerCase();
  if (text.includes("maintenance")) {
    return { category: "maintenance", tags: buildUniqueTags(["lodestone", "official", "maintenance"]) };
  }
  if (text.includes("patch") || text.includes("update")) {
    return { category: "patch", tags: buildUniqueTags(["lodestone", "official", "patch"]) };
  }
  if (text.includes("event") || text.includes("campaign")) {
    return { category: "event", tags: buildUniqueTags(["lodestone", "official", "event"]) };
  }
  if (text.includes("guide")) {
    return { category: "guide", tags: buildUniqueTags(["lodestone", "official", "guide"]) };
  }
  return { category: "news", tags: buildUniqueTags(["lodestone", "official", "news"]) };
}

export function parseLodestoneRss(xml: string): LodestoneItem[] {
  const itemMatches = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  return itemMatches
    .map((itemXml) => {
      const title = extractTagValue(itemXml, "title");
      const link = extractAlternateLink(itemXml) ?? extractTagValue(itemXml, "link");
      const description =
        extractTagValue(itemXml, "content") ?? extractTagValue(itemXml, "summary") ?? extractTagValue(itemXml, "description");
      const pubDate = extractTagValue(itemXml, "published") ?? extractTagValue(itemXml, "updated") ?? extractTagValue(itemXml, "pubDate");
      if (!title || !link || !description || !pubDate) {
        return null;
      }
      return {
        title,
        link,
        description,
        pubDate
      } satisfies LodestoneItem;
    })
    .filter((item): item is LodestoneItem => item !== null)
    .slice(0, 12);
}

function toGuide(item: LodestoneItem): NormalizedGuide {
  const slugBase = createSlug(item.title);
  const dateKey = item.pubDate.slice(0, 16).replace(/[^0-9]/g, "");
  const slug = slugBase.length > 0 ? `${slugBase}-${dateKey}` : `lodestone-${dateKey}`;
  const classification = classifyLodestoneItem(item);
  return {
    slug,
    locale: "en",
    title: item.title,
    summary: item.description.slice(0, 280),
    bodyMarkdown: `Source: ${item.link}\n\nPublished: ${item.pubDate}\n\n${item.description}`,
    category: classification.category,
    tags: classification.tags
  };
}

/**
 * Pulls latest official Lodestone news as normalized guide entries.
 */
export function createLodestoneNewsAdapter(): SourceAdapter {
  return {
    sourceKey: "lodestone-news",
    async fetchNormalized(env: ScraperEnv): Promise<NormalizedGuide[]> {
      const xml = await executeWithRetry<string>({
        operation: () =>
          fetchTextWithTimeout({
            url: LODESTONE_NEWS_RSS_URL,
            timeoutMs: env.fetchTimeoutMs
          }),
        retries: env.maxFetchRetries,
        baseDelayMs: env.retryBackoffMs
      });
      const items = parseLodestoneRss(xml);
      return items.map((item) => toGuide(item));
    }
  };
}
