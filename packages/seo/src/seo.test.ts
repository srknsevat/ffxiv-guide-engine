import test from "node:test";
import assert from "node:assert/strict";
import { buildArticleJsonLd } from "./index";

test("buildArticleJsonLd includes headline", () => {
  const actual = buildArticleJsonLd({
    locale: "en",
    title: "Test",
    description: "Desc",
    url: "https://example.com/g",
    dateModified: "2025-01-01T00:00:00.000Z"
  });
  assert.equal(actual["@graph"][0]["@type"], "Article");
  assert.equal((actual["@graph"][0] as { headline: string }).headline, "Test");
});
