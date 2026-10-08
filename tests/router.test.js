import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRoute, buildHash, parseQuery, buildQuery } from "../src/router.js";

test("Hash-Routen", () => {
  assert.deepEqual(parseRoute(""), { name: "home" });
  assert.deepEqual(parseRoute("#/"), { name: "home" });
  assert.deepEqual(parseRoute("#/suche"), { name: "search" });
  assert.deepEqual(parseRoute("#/p/moodle"), { name: "page", id: "moodle" });
  assert.deepEqual(parseRoute("#/woanders"), { name: "page", id: "woanders" });
  assert.equal(buildHash({ name: "home" }), "#/");
  assert.equal(buildHash({ name: "search" }), "#/suche");
  assert.equal(buildHash({ name: "page", id: "moodle" }), "#/p/moodle");
});

test("Query für Version und Suchbegriff", () => {
  assert.deepEqual(parseQuery("?v=b&q=Fachschaft"), { v: "b", q: "Fachschaft" });
  assert.deepEqual(parseQuery(""), { v: null, q: "" });
  assert.equal(buildQuery({ v: "a", q: "" }), "?v=a");
  assert.equal(buildQuery({ v: "b", q: "pj" }), "?v=b&q=pj");
});
