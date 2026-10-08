import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { mount } from "../src/app.js";

function start(hash = "#/", search = "") {
  const { document, window } = parseHTML("<!doctype html><div id=\"app\"></div>");
  if (!window.location) window.location = { hash: "", search: "", pathname: "/" };
  if (!window.history) window.history = { replaceState() {}, pushState() {} };
  const local = new Map();
  const session = new Map();
  const downloads = [];
  const storage = (map) => ({
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
  });
  window.location.hash = hash;
  window.location.search = search;
  window.innerWidth = 1000;
  let clock = new Date("2026-10-08T14:00:00.000Z");
  mount(document, window, {
    storageLocal: storage(local),
    storageSession: storage(session),
    now: () => clock,
    download: (name, text) => downloads.push({ name, text }),
  });
  return {
    document,
    window,
    downloads,
    session,
    local,
    setTime: (iso) => { clock = new Date(iso); },
  };
}

function hover(app, type, target, relatedTarget = null) {
  target.dispatchEvent(Object.assign(new app.window.Event(type, { bubbles: true }), { relatedTarget }));
}

const isOpen = (app, area) => !app.document.querySelector(`[data-menu='${area}']`).hidden;

test("Dropdown öffnet beim Überfahren und ein Menüpunkt wechselt die Seite", () => {
  const app = start();
  hover(app, "mouseover", app.document.querySelector("[data-area='studium']"));
  assert.equal(isOpen(app, "studium"), true);
  hover(app, "mouseover", app.document.querySelector("[data-area='forschung']"));
  assert.equal(isOpen(app, "studium"), false);
  assert.equal(isOpen(app, "forschung"), true);
  hover(app, "mouseover", app.document.querySelector("[data-area='studium']"));
  app.document.querySelector("[data-menu='studium'] [data-page='studierende']").click();
  assert.equal(app.document.querySelector("h1").textContent, "Für Studierende");
  assert.equal(app.document.querySelectorAll("[data-menu]:not([hidden])").length, 0);
  const log = JSON.parse(app.local.get("ummd-log"));
  assert.equal(log.entries.at(-1).page.origin, "Menü");
});

test("Dropdown schließt kurz nach dem Verlassen, aber nicht beim Wechsel ins Menü", async () => {
  const app = start();
  const button = app.document.querySelector("[data-area='studium']");
  const menu = app.document.querySelector("[data-menu='studium']");
  hover(app, "mouseover", button);
  hover(app, "mouseout", button, menu);
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert.equal(isOpen(app, "studium"), true);
  hover(app, "mouseout", menu, app.document.querySelector("#page"));
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert.equal(isOpen(app, "studium"), false);
});

test("Versionsklick schreibt keine Navigation und übersteht die Sitzung", () => {
  const app = start("#/p/moodle", "?v=a");
  const before = JSON.parse(app.local.get("ummd-log")).entries.length;
  app.document.querySelector("[data-version='b']").click();
  assert.equal(app.document.querySelector("[data-version='b']").getAttribute("aria-pressed"), "true");
  assert.equal(app.session.get("ummd-version"), "b");
  const entries = JSON.parse(app.local.get("ummd-log")).entries;
  assert.equal(entries.length, before + 1);
  assert.equal(entries.at(-1).type, "version");
});

test("Suche, Sprache, Marke und Download", () => {
  const app = start();
  app.document.querySelector("[data-search]").value = "Fachschaft";
  app.document.querySelector("[data-search-form]").dispatchEvent(new app.window.Event("submit", { bubbles: true, cancelable: true }));
  assert.ok(app.document.querySelector("[data-result='moodle']"));
  const language = app.document.querySelector("[data-lang-select]");
  language.querySelector("[value=en]").selected = true;
  language.dispatchEvent(new app.window.Event("change", { bubbles: true }));
  assert.match(app.document.querySelector("[data-result='moodle']").textContent, /learning platform/i);
  app.window.dispatchEvent(Object.assign(new app.window.Event("keydown"), { key: "M", shiftKey: true }));
  app.document.querySelector("[name='participant']").value = "Ada L.";
  app.document.querySelector("[name='group']").value = "Studierende";
  app.document.querySelector("[name='task']").value = "Moodle finden";
  app.document.querySelector("[data-mark]").click();
  app.document.querySelector("[data-result='moodle'] a").click();
  app.document.querySelector("[data-end]").click();
  assert.equal(app.downloads[0].name, "ummd-protokoll-Ada-L--2026-10-08.json");
  const saved = JSON.parse(app.downloads[0].text);
  assert.ok(saved.entries.some((entry) => entry.type === "search" && entry.search.query === "Fachschaft"));
  assert.ok(saved.entries.some((entry) => entry.type === "page" && entry.page.origin === "Suche"));
  assert.equal(app.local.get("ummd-log").includes("Fachschaft"), true);
});

test("Hub-Adresse in Version B landet auf der Startseite", () => {
  const app = start("#/p/studierende", "?v=b");
  assert.equal(app.document.querySelector("h1").textContent, "Universitätsmedizin Magdeburg");
  assert.equal(app.window.location.hash, "#/");
});
