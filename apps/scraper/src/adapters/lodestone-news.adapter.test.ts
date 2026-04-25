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

test("parseLodestoneRss parses lodestone atom entries", () => {
  const xml = `
  <feed>
    <entry>
      <title>Emergency Maintenance</title>
      <link rel="alternate" type="text/html" href="https://example.com/news-2" />
      <published>2026-04-24T14:35:00Z</published>
      <summary>Maintenance details</summary>
    </entry>
  </feed>
  `;
  const actual = parseLodestoneRss(xml);
  assert.equal(actual.length, 1);
  assert.equal(actual[0].title, "Emergency Maintenance");
  assert.equal(actual[0].link, "https://example.com/news-2");
  assert.equal(actual[0].pubDate, "2026-04-24T14:35:00Z");
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
