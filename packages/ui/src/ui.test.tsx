import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PageShell } from "./index";

test("PageShell renders title", () => {
  const actual = renderToStaticMarkup(createElement(PageShell, { title: "T", children: "body" }));
  assert.match(actual, /T/);
});
