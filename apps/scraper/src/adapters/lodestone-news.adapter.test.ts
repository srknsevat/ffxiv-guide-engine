import test from "node:test";
import assert from "node:assert/strict";
import { classifyLodestoneItem, parseLodestoneRss } from "./lodestone-news.adapter";

test("parseLodestoneRss parses rss items", () => {
  const xml = `
  <rss><channel>
    <item>
      <title><![CDATA[Patch 7.1 Notes]]></title>
      <link>https://example.com/news-1</link>
      <description><![CDATA[<p>Major update details</p>]]></description>
      <pubDate>Fri, 24 Apr 2026 10:00:00 GMT</pubDate>
    </item>
  </channel></rss>
  `;
  const actual = parseLodestoneRss(xml);
  assert.equal(actual.length, 1);
  assert.equal(actual[0].title, "Patch 7.1 Notes");
  assert.equal(actual[0].link, "https://example.com/news-1");
});

test("classifyLodestoneItem categorizes patch notes", () => {
  const actual = classifyLodestoneItem({
    title: "Patch 7.1 Notes",
    link: "https://example.com/news-1",
    description: "Major update details",
    pubDate: "Fri, 24 Apr 2026 10:00:00 GMT"
  });
  assert.equal(actual.category, "patch");
  assert.deepEqual(actual.tags, ["lodestone", "official", "patch"]);
});
