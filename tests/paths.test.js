import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPaths } from "../src/paths.js";

const at = (second) => `2026-10-09T13:00:${String(second).padStart(2, "0")}.000Z`;
const page = (second, path, title, origin = "Menü", task = null) => ({ type: "page", version: "b", page: { path, title, origin }, at: at(second), task });
const hover = (second, element, sekunden, geklickt = false) => ({ type: "hover", version: "b", hover: { element, bereich: "Mega-Menü", sekunden, geklickt }, at: at(second), task: null });

test("Pfade laufen von der Startseite bis zur letzten Station vor der Rückkehr", () => {
  const paths = buildPaths([
    { type: "start", version: "b", at: at(0), task: null },
    page(0, "#/", "Universitätsmedizin Magdeburg", "Teststart"),
    hover(2, "Institute", 0.6),
    hover(3, "Kliniken", 0.5, true),
    page(4, "#/p/kliniken", "Kliniken", "Menü", { task: "Klinik finden" }),
    page(10, "#/p/kontakt", "Kontakt", "Kopfzeile"),
    hover(20, "Logo", 1.0, true),
    page(30, "#/", "Universitätsmedizin Magdeburg", "Logo"),
    page(31, "#/", "Universitätsmedizin Magdeburg", "Logo"),
    page(35, "#/p/anfahrt", "Anfahrt", "Kopfzeile"),
    { type: "end", version: "b", at: at(40), task: null },
  ]);

  assert.equal(paths.length, 2);
  assert.deepEqual(
    { ziel: paths[0].ziel, dauer: paths[0].dauerSekunden, klicks: paths[0].klicks, task: paths[0].task },
    { ziel: "Kontakt", dauer: 10, klicks: 2, task: "Klinik finden" },
  );
  assert.equal(paths[0].schritte[0].seite, "Startseite");
  assert.equal(paths[0].schritte[1].sekundenSeitVorher, 4);
  assert.deepEqual(paths[0].schritte[1].mausVorher.map((item) => item.element), ["Institute", "Kliniken"]);
  assert.equal(paths[0].schritte[1].mausVorher[1].geklickt, true);
  assert.equal(paths[0].schritte[2].mausVorher, undefined);
  assert.deepEqual([paths[1].nr, paths[1].ziel, paths[1].dauerSekunden], [2, "Anfahrt", 4]);
});
