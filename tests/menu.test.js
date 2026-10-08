import { test } from "node:test";
import assert from "node:assert/strict";
import { menuFor } from "../src/menu.js";

test("Version A liefert die Seitennamen als Links", () => {
  const menu = menuFor("studium", "a", "de");
  assert.equal(menu.type, "links");
  assert.deepEqual(menu.items.map((item) => item.label), [
    "Für Studieninteressierte", "Für Studierende", "Für Lehrende", "Studiendekanat",
  ]);
  assert.equal(menu.items[0].id, "studieninteressierte");
});

test("Version B liefert nicht klickbare Spalten mit Seitenlinks", () => {
  const menu = menuFor("studium", "b", "de");
  assert.equal(menu.type, "columns");
  assert.equal(menu.columns[3].label, "Anlaufstellen");
  assert.deepEqual(menu.columns[3].items.map((item) => item.id), ["studiendekanat", "auslandsamt"]);
  assert.equal(menuFor("studium", "b", "en").columns[3].label, "Contact points");
});
