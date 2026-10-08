import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyLog, record, fileName, serialize } from "../src/log.js";

test("Seitenaufruf übernimmt die geltende Aufgabenmarke", () => {
  let log = emptyLog();
  log = record(log, {
    type: "task",
    version: "a",
    taskMark: { participant: "p1", group: "Studierende", task: "Moodle finden" },
  }, "2026-10-08T14:00:00.000Z");
  log = record(log, {
    type: "page",
    version: "a",
    page: { path: "#/moodle", title: "Moodle", origin: "Menü" },
  }, "2026-10-08T14:01:00.000Z");
  assert.equal(log.entries[1].task.participant, "p1");
  assert.equal(log.entries[0].task.task, "Moodle finden");
  assert.equal(Object.hasOwn(log.entries[1], "firstClick"), false);
});

test("vor der ersten Marke ist die Aufgabe null", () => {
  const log = record(emptyLog(), {
    type: "search",
    version: "b",
    search: { query: "pj", count: 1 },
  }, "2026-10-08T14:00:00.000Z");
  assert.equal(log.entries[0].task, null);
});

test("Dateiname und JSON", () => {
  assert.equal(fileName("", "2026-10-08"), "ummd-protokoll-unbenannt-2026-10-08.json");
  assert.equal(fileName("Ada L.", "2026-10-08"), "ummd-protokoll-Ada-L--2026-10-08.json");
  const log = record(emptyLog(), {
    type: "version",
    version: "b",
    versionChange: { from: "a", to: "b" },
  }, "2026-10-08T14:00:00.000Z");
  const parsed = JSON.parse(serialize(log));
  assert.equal(parsed.participant, "");
  assert.equal(parsed.entries[0].versionChange.to, "b");
});
