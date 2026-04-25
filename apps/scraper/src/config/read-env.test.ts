import test from "node:test";
import assert from "node:assert/strict";
import { readScraperEnv } from "./read-env";

test("readScraperEnv provides defaults", () => {
  const actual = readScraperEnv();
  assert.ok(actual.apiBaseUrl.length > 0);
  assert.equal(actual.maxAttempts, 3);
  assert.equal(actual.retryBackoffMs, 3000);
  assert.equal(actual.workerConcurrency, 2);
});
