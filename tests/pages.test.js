import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveTarget, areaLabel } from "../src/pages.js";

test("Hubs gibt es in Version B nicht", () => {
  assert.deepEqual(resolveTarget("studierende", "a"), { kind: "page", id: "studierende" });
  assert.deepEqual(resolveTarget("studierende", "b"), { kind: "home" });
  assert.deepEqual(resolveTarget("moodle", "b"), { kind: "page", id: "moodle" });
});

test("leere Id ist die Startseite, unbekannte Id fehlt", () => {
  assert.deepEqual(resolveTarget(null, "a"), { kind: "home" });
  assert.deepEqual(resolveTarget("gibt-es-nicht", "a"), { kind: "missing" });
});

test("Bereichsnamen", () => {
  assert.equal(areaLabel("direkt", "de"), "Direkt");
  assert.equal(areaLabel("studium", "en"), "Study & teaching");
});
