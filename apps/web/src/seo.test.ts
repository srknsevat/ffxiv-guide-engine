import test from "node:test";
import assert from "node:assert/strict";
import { isSupportedLocale } from "./i18n/locales";

test("isSupportedLocale accepts en and tr", () => {
  assert.equal(isSupportedLocale("en"), true);
  assert.equal(isSupportedLocale("tr"), true);
  assert.equal(isSupportedLocale("de"), false);
});
