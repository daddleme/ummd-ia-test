import { test } from "node:test";
import assert from "node:assert/strict";
import { searchPages } from "../src/search.js";

test("kurze Eingabe sucht nicht", () => {
  assert.equal(searchPages("  a ", "a", "de"), null);
  assert.equal(searchPages("", "a", "de"), null);
});

test("Fachschaft trifft die Studierendenseiten und das Synonym Moodle", () => {
  const hits = searchPages("Fachschaft", "a", "de");
  assert.deepEqual(hits, ["studierende", "moodle", "skillslab", "sp-programm"]);
});

test("Version B blendet Hub-Seiten aus", () => {
  assert.deepEqual(searchPages("Fachschaft", "b", "de"), ["moodle", "skillslab", "sp-programm"]);
});

test("Synonym Notaufnahme trifft Notfall, Unsinn trifft nichts", () => {
  assert.deepEqual(searchPages("Notaufnahme", "a", "de"), ["notfall"]);
  assert.deepEqual(searchPages("xyzxyz", "a", "de"), []);
});

test("Bewerbung trifft die Seiten, auf denen das Wort steht", () => {
  const hits = searchPages("Bewerbung", "a", "de");
  assert.ok(hits.includes("bewerbung"));
  assert.ok(hits.includes("auslandsamt"));
  assert.equal(hits.indexOf("bewerbung") < hits.indexOf("auslandsamt"), true);
});
