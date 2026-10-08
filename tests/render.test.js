import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { buildView } from "../src/view.js";
import { render } from "../src/render.js";

function doc(state) {
  return parseHTML(render(buildView(state))).document;
}

const base = {
  version: "a",
  lang: "de",
  route: { name: "home" },
  query: "",
  openArea: null,
  moderatorOpen: false,
  moderator: { participant: "", group: "", task: "" },
};

test("Ebene 1 und Testleiste sind auf der Startseite da", () => {
  const document = doc(base);
  assert.equal(document.querySelector("h1").textContent, "Universitätsmedizin Magdeburg");
  assert.equal(document.querySelector("[data-page='notfall']").classList.contains("is-emergency"), true);
  assert.equal(document.querySelector("[data-search]").getAttribute("aria-label"), "Suche");
  assert.equal(document.querySelector("[data-version='a']").getAttribute("aria-pressed"), "true");
  assert.equal(document.querySelector("aside"), null);
});

test("Version A zeigt ein Dropdown und Kacheln über der Liste", () => {
  const document = doc({ ...base, openArea: "studium", route: { name: "page", id: "studierende" } });
  assert.deepEqual([...document.querySelectorAll("[data-popup] a")].map((node) => node.textContent), [
    "Für Studieninteressierte", "Für Studierende", "Für Lehrende", "Studiendekanat",
  ]);
  const main = document.querySelector("main").textContent;
  assert.equal(main.indexOf("Moodle") < main.indexOf("Auf dieser Seite"), true);
});

test("Version B macht Spaltenüberschriften zu Text und Hubs zur Startseite", () => {
  const document = doc({ ...base, version: "b", openArea: "studium", route: { name: "page", id: "studierende" } });
  assert.equal(document.querySelector("h1").textContent, "Universitätsmedizin Magdeburg");
  const heading = [...document.querySelectorAll("[data-panel] h2")].find((node) => node.textContent === "Anlaufstellen");
  assert.equal(heading.matches("a"), false);
  assert.ok([...document.querySelectorAll("[data-panel] a")].some((node) => node.dataset.page === "auslandsamt"));
});

test("Suche zeigt Treffer oder den Hinweis mit dem Begriff", () => {
  const hit = doc({ ...base, route: { name: "search" }, query: "Notaufnahme" });
  assert.equal(hit.querySelector("[data-search]").value, "Notaufnahme");
  assert.equal(hit.querySelector("[data-result='notfall'] h2").textContent, "Notfall");
  assert.equal(hit.querySelector("[data-result='notfall'] p").textContent, "Direkt");
  const miss = doc({ ...base, route: { name: "search" }, query: "xyzxyz" });
  assert.match(miss.querySelector("main").textContent, /Keine Treffer für xyzxyz/);
});

test("Englisch schaltet Seitentext, die Testleiste bleibt deutsch", () => {
  const document = doc({ ...base, lang: "en", route: { name: "page", id: "wir" } });
  assert.equal(document.querySelector("h1").textContent, "Who we are");
  assert.match(document.querySelector("main").textContent, /Sites/);
  assert.equal(document.querySelector("[data-end]").textContent, "Test beenden");
});

test("unbekannte Seite und geschlossene Moderation", () => {
  const document = doc({ ...base, route: { name: "page", id: "fehlt" }, moderatorOpen: false });
  assert.match(document.querySelector("main").textContent, /Diese Seite gibt es im Prototyp nicht/);
  assert.equal(document.querySelector("[data-moderator]"), null);
});
