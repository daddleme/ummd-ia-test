import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveVersion } from "../src/version.js";

test("Adresse gewinnt vor dem gespeicherten Wert", () => {
  assert.equal(resolveVersion("?v=b", "a"), "b");
  assert.equal(resolveVersion("?v=a", "b"), "a");
});

test("ohne Adresswert gilt die Sitzung, sonst A", () => {
  assert.equal(resolveVersion("", "b"), "b");
  assert.equal(resolveVersion("?q=pj", "a"), "a");
  assert.equal(resolveVersion("", null), "a");
  assert.equal(resolveVersion("?v=c", "b"), "b");
  assert.equal(resolveVersion("?v=c", null), "a");
});
