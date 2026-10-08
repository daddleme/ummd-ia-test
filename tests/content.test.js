import { test } from "node:test";
import assert from "node:assert/strict";
import { content } from "../src/content.js";

function strings(value, found = []) {
  if (typeof value === "string") found.push(value);
  else if (Array.isArray(value)) value.forEach((item) => strings(item, found));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => strings(item, found));
  return found;
}

test("kein sichtbarer Text enthält ein und-Zeichen", () => {
  for (const value of strings(content)) assert.equal(value.includes("&"), false, value);
});

test("Startseite hat den festgelegten Satz", () => {
  assert.equal(content.home.de.title, "Universitätsmedizin Magdeburg");
  assert.equal(content.home.de.sentence, "Die Universitätsmedizin Magdeburg verbindet Krankenversorgung, Forschung und Lehre.");
  assert.equal(content.home.en.title, "University Medicine Magdeburg");
  assert.ok(content.home.en.sentence.includes(" and "));
});

test("Version A listet die dritte Ebene aus der Spec", () => {
  const a = Object.fromEntries(content.areas.map((area) => [area.id, area.a]));
  assert.deepEqual(a.behandlung, ["kliniken", "versorgungszentren", "institute", "ambulanzen", "aufenthalt", "zuweisende"]);
  assert.deepEqual(a.forschung, ["schwerpunkte", "klinische-studien", "infrastruktur", "kooperationen", "nachwuchs"]);
  assert.deepEqual(a.studium, ["studieninteressierte", "studierende", "lehrende", "studiendekanat"]);
  assert.deepEqual(a.karriere, ["stellenangebote", "berufungsverfahren", "ausbildung", "fortbildung", "benefits"]);
  assert.deepEqual(a.ueber, ["wir", "leitung", "einrichtungen", "kultur", "presse"]);
});

test("Version B hat die freigegebenen Spalten und keine Einzelspalte", () => {
  const columns = Object.fromEntries(content.areas.map((area) => [area.id, area.b.map((column) => [column.de, column.pages])]));
  assert.deepEqual(columns.behandlung, [
    ["Behandlung finden", ["kliniken", "versorgungszentren", "institute", "ambulanzen"]],
    ["Aufenthalt und Zuweisung", ["aufenthalt", "zuweisende"]],
  ]);
  assert.deepEqual(columns.forschung, [
    ["Themen", ["schwerpunkte", "klinische-studien"]],
    ["Zusammenarbeit", ["infrastruktur", "kooperationen", "nachwuchs"]],
  ]);
  assert.deepEqual(columns.studium, [
    ["Für Studieninteressierte", ["studienangebote", "bewerbung"]],
    ["Für Studierende", ["moodle", "skillslab", "sp-programm"]],
    ["Für Lehrende", ["lehrangebote", "weiterbildung"]],
    ["Anlaufstellen", ["studiendekanat", "auslandsamt"]],
  ]);
  assert.deepEqual(columns.karriere, [
    ["Offene Stellen", ["stellenangebote", "berufungsverfahren"]],
    ["Ausbildung und Arbeiten", ["ausbildung", "fortbildung", "benefits"]],
  ]);
  assert.deepEqual(columns.ueber, [
    ["Porträt", ["wir", "kultur", "presse"]],
    ["Leitung und Einrichtungen", ["leitung", "einrichtungen"]],
  ]);
  for (const area of content.areas) {
    for (const column of area.b) assert.ok(column.pages.length >= 2, column.de);
  }
});

test("Hubs und jede verlinkte Id haben eine Seite in beiden Sprachen", () => {
  assert.deepEqual(content.hubs, {
    studieninteressierte: ["studienangebote", "bewerbung"],
    studierende: ["moodle", "skillslab", "sp-programm"],
    lehrende: ["lehrangebote", "weiterbildung"],
    studiendekanat: ["auslandsamt"],
  });
  const ids = new Set(Object.keys(content.pages));
  for (const area of content.areas) {
    for (const id of area.a) assert.ok(ids.has(id), id);
    for (const column of area.b) for (const id of column.pages) assert.ok(ids.has(id), id);
  }
  for (const page of Object.values(content.pages)) {
    for (const lang of ["de", "en"]) {
      assert.ok(page[lang].title);
      assert.ok(page[lang].sentence);
      assert.ok(page[lang].items.length >= 2);
    }
  }
});

test("Stichworte, die kein Menüpunkt sind, stehen auf der genannten Seite", () => {
  assert.deepEqual(content.pages.schwerpunkte.de.items, ["Schwerpunkte", "Suche Einrichtung", "beteiligte Kliniken"]);
  assert.deepEqual(content.pages.wir.de.items, ["Krankenversorgung", "Forschung", "Lehre", "Standorte"]);
  assert.deepEqual(content.pages.kultur.de.items, ["Leitbild", "Zusammenarbeit", "Qualität und Verantwortung"]);
  assert.ok(content.pages.bewerbung.de.items.includes("Bewerbung international"));
  assert.ok(content.pages.auslandsamt.de.items.includes("Bewerbung international"));
  for (const id of ["studierende", "moodle", "skillslab", "sp-programm"]) {
    assert.ok(content.pages[id].de.items.includes("PJ"));
    assert.ok(content.pages[id].de.items.includes("Fachschaftsrat"));
  }
});

test("Synonyme zeigen auf vorhandene Seiten", () => {
  assert.deepEqual(content.synonyms, [
    { terms: ["notaufnahme", "notruf"], page: "notfall" },
    { terms: ["fachschaft", "fachschaftsrat"], page: "moodle" },
    { terms: ["pj", "praktisches jahr"], page: "moodle" },
    { terms: ["international", "ausland"], page: "bewerbung" },
    { terms: ["anfahrt", "parken", "adresse"], page: "kontakt" },
    { terms: ["zuweisung", "einweisung"], page: "zuweisende" },
    { terms: ["jobs", "stellen"], page: "stellenangebote" },
  ]);
  for (const synonym of content.synonyms) assert.ok(content.pages[synonym.page]);
});
