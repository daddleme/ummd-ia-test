# Navigationsprototyp UMMD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static two-version click prototype of the UMMD navigation for a moderated usability test, including keyword search and a local session log.

**Architecture:** One content module holds both languages, both menus, page copy, and synonyms. Pure functions resolve the version, the open menu, the current page, and search hits. A string renderer turns a view model into HTML. `app.js` wires the address bar, `sessionStorage`, `localStorage`, and the download. There is no build step and no server. ES modules are loaded directly by the browser. Several files replace the spec's "one script file" so each file stays one responsibility; the no-build rule still holds.

**Tech Stack:** HTML, CSS, ES modules, Node.js built-in test runner (`node --test`), `linkedom` 0.18.13 only as a dev dependency for DOM tests.

## Global Constraints

- Eine statische Website, später unter einem öffentlichen Link. Kein Server, keine Anmeldung.
- Bezeichnungen, die zwei Bereiche verbinden (Navigation, Spaltenüberschriften, Seitentitel, Listeneinträge), nutzen „&“, um Platz zu sparen. Ganze Sätze schreiben „und“ aus.
- Es gibt keinen Build-Schritt. HTML, CSS und ES-Module genügen.
- Die Handy-Ansicht ist nicht Teil dieses Prototyps. Das Fenster wird so breit vorausgesetzt, dass Ebene 2 in einer Zeile steht.
- DE/EN schaltet Navigationsbezeichnungen, Seitentitel, den einen Satz und die Liste „Auf dieser Seite“. Die Testleiste bleibt deutsch.
- Das Protokoll bleibt im Browser der teilnehmenden Person. „Test beenden“ lädt eine Datei herunter. Es wird nichts übertragen.
- Notfall und Kontakt und Anfahrt gehören zum Bereich „Direkt“ und stehen in der Trefferliste vor den fünf Hauptbereichen.
- Ein Besuch ohne Klick in der Seite bekommt die Herkunft „direkte Adresse“. Das gilt für das erste Laden und für die Zurück-Taste.
- Die Ergebnisseite erzeugt keinen Seitenaufruf. Erst der Klick auf ein Ergebnis tut das, mit Herkunft „Suche“.

---

### Task 1: Inhaltsdaten

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `src/content.js`
- Test: `tests/content.test.js`

**Interfaces:**
- Consumes: nichts
- Produces: `export const content` mit `home`, `ui`, `areas`, `pages`, `hubs`, `synonyms`, `pageOrder`. Jede Seite hat `id`, `area` und `de`/`en` mit `title`, `sentence`, `items`. Jeder Bereich hat `id`, `de`, `en`, `a` (Liste von Seiten-Ids) und `b` (Liste von `{ de, en, pages }`). `hubs` bildet eine Hub-Id auf Kachel-Ids ab. `synonyms` ist `[{ terms: string[], page: string }]`. `pageOrder` ist die Suchreihenfolge.

- [ ] **Step 1: Write the failing test**

Create `tests/content.test.js`:

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/content.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `../src/content.js`

- [ ] **Step 3: Write minimal implementation**

Create `package.json`:

```json
{
  "name": "ummd-nav-prototype",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  },
  "devDependencies": {
    "linkedom": "0.18.13"
  }
}
```

Create `.gitignore`:

```gitignore
node_modules/
```

Create `src/content.js` with `export const content = { ... }`. Use these exact German strings from the spec. English is the direct translation, with the word "and" written out.

```javascript
export const content = {
  home: {
    de: {
      title: "Universitätsmedizin Magdeburg",
      sentence: "Die Universitätsmedizin Magdeburg verbindet Krankenversorgung, Forschung und Lehre.",
    },
    en: {
      title: "University Medicine Magdeburg",
      sentence: "University Medicine Magdeburg combines patient care, research and teaching.",
    },
  },
  ui: {
    de: {
      searchLabel: "Suche",
      searchButton: "Suchen",
      onThisPage: "Auf dieser Seite",
      noResults: "Keine Treffer für",
      missing: "Diese Seite gibt es im Prototyp nicht",
      homeLink: "Zur Startseite",
      areaDirekt: "Direkt",
    },
    en: {
      searchLabel: "Search",
      searchButton: "Search",
      onThisPage: "On this page",
      noResults: "No results for",
      missing: "This page is not in the prototype",
      homeLink: "To the home page",
      areaDirekt: "Direct",
    },
  },
  areas: [
    {
      id: "behandlung",
      de: "Behandlung und Aufenthalt",
      en: "Treatment and stay",
      a: ["kliniken", "versorgungszentren", "institute", "ambulanzen", "aufenthalt", "zuweisende"],
      b: [
        { de: "Behandlung finden", en: "Find treatment", pages: ["kliniken", "versorgungszentren", "institute", "ambulanzen"] },
        { de: "Aufenthalt und Zuweisung", en: "Stay and referral", pages: ["aufenthalt", "zuweisende"] },
      ],
    },
    {
      id: "forschung",
      de: "Forschung und Innovation",
      en: "Research and innovation",
      a: ["schwerpunkte", "klinische-studien", "infrastruktur", "kooperationen", "nachwuchs"],
      b: [
        { de: "Themen", en: "Topics", pages: ["schwerpunkte", "klinische-studien"] },
        { de: "Zusammenarbeit", en: "Collaboration", pages: ["infrastruktur", "kooperationen", "nachwuchs"] },
      ],
    },
    {
      id: "studium",
      de: "Studium und Lehre",
      en: "Study and teaching",
      a: ["studieninteressierte", "studierende", "lehrende", "studiendekanat"],
      b: [
        { de: "Für Studieninteressierte", en: "For prospective students", pages: ["studienangebote", "bewerbung"] },
        { de: "Für Studierende", en: "For students", pages: ["moodle", "skillslab", "sp-programm"] },
        { de: "Für Lehrende", en: "For teachers", pages: ["lehrangebote", "weiterbildung"] },
        { de: "Anlaufstellen", en: "Contact points", pages: ["studiendekanat", "auslandsamt"] },
      ],
    },
    {
      id: "karriere",
      de: "Karriere und Ausbildung",
      en: "Career and training",
      a: ["stellenangebote", "berufungsverfahren", "ausbildung", "fortbildung", "benefits"],
      b: [
        { de: "Offene Stellen", en: "Open positions", pages: ["stellenangebote", "berufungsverfahren"] },
        { de: "Ausbildung und Arbeiten", en: "Training and working", pages: ["ausbildung", "fortbildung", "benefits"] },
      ],
    },
    {
      id: "ueber",
      de: "Über die UMMD",
      en: "About UMMD",
      a: ["wir", "leitung", "einrichtungen", "kultur", "presse"],
      b: [
        { de: "Porträt", en: "Portrait", pages: ["wir", "kultur", "presse"] },
        { de: "Leitung und Einrichtungen", en: "Leadership and institutions", pages: ["leitung", "einrichtungen"] },
      ],
    },
  ],
  hubs: {
    studieninteressierte: ["studienangebote", "bewerbung"],
    studierende: ["moodle", "skillslab", "sp-programm"],
    lehrende: ["lehrangebote", "weiterbildung"],
    studiendekanat: ["auslandsamt"],
  },
  synonyms: [
    { terms: ["notaufnahme", "notruf"], page: "notfall" },
    { terms: ["fachschaft", "fachschaftsrat"], page: "moodle" },
    { terms: ["pj", "praktisches jahr"], page: "moodle" },
    { terms: ["international", "ausland"], page: "bewerbung" },
    { terms: ["anfahrt", "parken", "adresse"], page: "kontakt" },
    { terms: ["zuweisung", "einweisung"], page: "zuweisende" },
    { terms: ["jobs", "stellen"], page: "stellenangebote" },
  ],
  pageOrder: [
    "notfall", "kontakt",
    "kliniken", "versorgungszentren", "institute", "ambulanzen", "aufenthalt", "zuweisende",
    "schwerpunkte", "klinische-studien", "infrastruktur", "kooperationen", "nachwuchs",
    "studieninteressierte", "studierende", "lehrende", "studiendekanat",
    "studienangebote", "bewerbung", "moodle", "skillslab", "sp-programm",
    "lehrangebote", "weiterbildung", "auslandsamt",
    "stellenangebote", "berufungsverfahren", "ausbildung", "fortbildung", "benefits",
    "wir", "leitung", "einrichtungen", "kultur", "presse",
  ],
  pages: {
    notfall: page("direkt", "Notfall", "Hilfe bei einem medizinischen Notfall auf dem Campus.", ["Notaufnahme", "Notruf", "Weg zur Notaufnahme"], "Emergency", "Help in a medical emergency on campus.", ["Emergency department", "Emergency number", "Way to the emergency department"]),
    kontakt: page("direkt", "Kontakt und Anfahrt", "So erreichen Sie die UMMD.", ["Adresse", "Anfahrt", "Parken", "Kontakt"], "Contact and directions", "How to reach UMMD.", ["Address", "Directions", "Parking", "Contact"]),
    kliniken: page("behandlung", "Kliniken", "Die Kliniken der UMMD im Überblick.", ["Klinikübersicht", "Ansprechpartner", "Sprechstunden"], "Clinics", "The UMMD clinics at a glance.", ["Clinic overview", "Contacts", "Consultation hours"]),
    versorgungszentren: page("behandlung", "Medizinische Versorgungszentren", "Versorgung außerhalb der Kliniken.", ["Standorte der Zentren", "Angebote", "Kontakt"], "Medical care centers", "Care outside the clinics.", ["Center locations", "Services", "Contact"]),
    institute: page("behandlung", "Institute", "Die Institute der Medizinischen Fakultät.", ["Institutsübersicht", "Forschung an den Instituten", "Kontakt"], "Institutes", "The institutes of the Medical Faculty.", ["Institute overview", "Research at the institutes", "Contact"]),
    ambulanzen: page("behandlung", "Ambulanzen", "Ambulante Behandlung an der UMMD.", ["Ambulanzübersicht", "Sprechstunden", "Anmeldung"], "Outpatient clinics", "Outpatient care at UMMD.", ["Outpatient clinic overview", "Consultation hours", "Registration"]),
    aufenthalt: page("behandlung", "Aufenthalt und Besuch", "Informationen für den Aufenthalt und für Besuche.", ["Besuchszeiten", "Übernachtung", "Service vor Ort"], "Stay and visit", "Information for a stay and for visits.", ["Visiting hours", "Overnight stay", "On-site services"]),
    zuweisende: page("behandlung", "Für Zuweisende", "Zugang für zuweisende Ärztinnen und Ärzte.", ["Zuweisung", "Einweisung", "Kontakt"], "For referring physicians", "Access for referring physicians.", ["Referral", "Admission", "Contact"]),
    schwerpunkte: page("forschung", "Forschungsschwerpunkte", "Die wissenschaftlichen Schwerpunkte der UMMD.", ["Schwerpunkte", "Suche Einrichtung", "beteiligte Kliniken"], "Research focus areas", "The scientific focus areas of UMMD.", ["Focus areas", "Find a facility", "Participating clinics"]),
    "klinische-studien": page("forschung", "Klinische Studien", "Studien, an denen die UMMD beteiligt ist.", ["Laufende Studien", "Teilnahme", "Kontakt"], "Clinical studies", "Studies that UMMD takes part in.", ["Current studies", "Participation", "Contact"]),
    infrastruktur: page("forschung", "Forschungsinfrastruktur", "Geräte und Einrichtungen für die Forschung.", ["Zentrale Forschungsplattformen", "Großgeräte", "Nutzung"], "Research infrastructure", "Equipment and facilities for research.", ["Central research platforms", "Large equipment", "Use"]),
    kooperationen: page("forschung", "Kooperationen", "Partner in Forschung und Versorgung.", ["Verbünde", "Partner", "Ansprechpartner"], "Cooperations", "Partners in research and care.", ["Networks", "Partners", "Contacts"]),
    nachwuchs: page("forschung", "Nachwuchsförderung", "Wege in die wissenschaftliche Karriere.", ["Promotion", "Programme", "Beratung"], "Early career support", "Paths into a scientific career.", ["Doctorate", "Programs", "Advice"]),
    studieninteressierte: page("studium", "Für Studieninteressierte", "Einstieg für Menschen, die an der UMMD studieren wollen.", ["Studienangebote", "Bewerbung"], "For prospective students", "Starting point for people who want to study at UMMD.", ["Study programs", "Application"]),
    studierende: page("studium", "Für Studierende", "Einstieg für eingeschriebene Studierende.", ["Moodle", "Skillslab", "SP-Programm", "PJ", "Fachschaftsrat"], "For students", "Starting point for enrolled students.", ["Moodle", "Skillslab", "SP program", "PJ", "Student council"]),
    lehrende: page("studium", "Für Lehrende", "Einstieg für Lehrende der UMMD.", ["Lehrangebote", "Weiterbildung"], "For teachers", "Starting point for teachers at UMMD.", ["Teaching offers", "Continuing education"]),
    studiendekanat: page("studium", "Studiendekanat", "Anlaufstelle für Studium und Lehre.", ["Ansprechpartner", "Akademisches Auslandsamt"], "Dean of Studies office", "Contact point for study and teaching.", ["Contacts", "International Office"]),
    studienangebote: page("studium", "Studienangebote", "Welche Studiengänge die UMMD anbietet.", ["Studiengänge", "Abschlüsse", "Voraussetzungen"], "Study programs", "Which degree programs UMMD offers.", ["Degree programs", "Degrees", "Requirements"]),
    bewerbung: page("studium", "Bewerbung", "So bewerben Sie sich um einen Studienplatz.", ["Fristen", "Voraussetzungen", "Bewerbung international"], "Application", "How to apply for a place to study.", ["Deadlines", "Requirements", "International application"]),
    moodle: page("studium", "Moodle", "Die Lernplattform für Studierende.", ["Zugang", "Kurse", "PJ", "Fachschaftsrat"], "Moodle", "The learning platform for students.", ["Access", "Courses", "PJ", "Student council"]),
    skillslab: page("studium", "Skillslab", "Üben praktischer Fertigkeiten.", ["Kurse", "Räume", "PJ", "Fachschaftsrat"], "Skillslab", "Practice for clinical skills.", ["Courses", "Rooms", "PJ", "Student council"]),
    "sp-programm": page("studium", "SP-Programm", "Das Studienprogramm SP.", ["Aufbau", "Anmeldung", "PJ", "Fachschaftsrat"], "SP program", "The SP study program.", ["Structure", "Registration", "PJ", "Student council"]),
    lehrangebote: page("studium", "Lehrangebote", "Lehre an der UMMD für Dozierende.", ["Lehrveranstaltungen", "Materialien", "Ansprechpartner"], "Teaching offers", "Teaching at UMMD for lecturers.", ["Courses", "Materials", "Contacts"]),
    weiterbildung: page("studium", "Weiterbildung", "Weiterbildung für Lehrende.", ["Medizindidaktik", "Kurse", "Anmeldung"], "Continuing education", "Continuing education for teachers.", ["Medical didactics", "Courses", "Registration"]),
    auslandsamt: page("studium", "Akademisches Auslandsamt", "Studium mit internationalem Bezug.", ["Auslandsaufenthalt", "Studierende aus dem Ausland", "Bewerbung international"], "International Office", "Study with an international dimension.", ["Stay abroad", "Students from abroad", "International application"]),
    stellenangebote: page("karriere", "Stellenangebote", "Offene Stellen an der UMMD.", ["Aktuelle Stellen", "Bewerbung auf eine Stelle", "Kontakt"], "Job openings", "Open positions at UMMD.", ["Current positions", "Apply for a position", "Contact"]),
    berufungsverfahren: page("karriere", "Berufungsverfahren", "Verfahren für Professuren.", ["Laufende Verfahren", "Ablauf", "Kontakt"], "Appointment procedures", "Procedures for professorships.", ["Current procedures", "Process", "Contact"]),
    ausbildung: page("karriere", "Ausbildung", "Ausbildung an der UMMD.", ["Berufe", "freie Plätze", "Bewerbung"], "Vocational training", "Vocational training at UMMD.", ["Occupations", "Open places", "Application"]),
    fortbildung: page("karriere", "Fort- und Weiterbildung", "Fortbildung für Beschäftigte.", ["Programm", "Anmeldung", "Zertifikate"], "Staff training", "Continuing education for staff.", ["Program", "Registration", "Certificates"]),
    benefits: page("karriere", "Benefits", "Was die UMMD als Arbeitgeberin bietet.", ["Arbeitsbedingungen", "Familie", "Entwicklung"], "Benefits", "What UMMD offers as an employer.", ["Working conditions", "Family", "Development"]),
    wir: page("ueber", "Wer wir sind", "Auftrag und Aufbau der UMMD.", ["Krankenversorgung", "Forschung", "Lehre", "Standorte"], "Who we are", "Mission and structure of UMMD.", ["Patient care", "Research", "Teaching", "Sites"]),
    leitung: page("ueber", "Leitungsvorstand", "Die Leitung der UMMD.", ["Mitglieder", "Aufgaben", "Kontakt"], "Executive board", "The leadership of UMMD.", ["Members", "Responsibilities", "Contact"]),
    einrichtungen: page("ueber", "Einrichtungen", "Einrichtungen unter dem Dach der UMMD.", ["Fakultät", "Klinikum", "weitere Einrichtungen"], "Institutions", "Institutions under the UMMD umbrella.", ["Faculty", "University hospital", "Other institutions"]),
    kultur: page("ueber", "Kultur und Werte", "Wofür die UMMD steht.", ["Leitbild", "Zusammenarbeit", "Qualität und Verantwortung"], "Culture and values", "What UMMD stands for.", ["Mission statement", "Collaboration", "Quality and responsibility"]),
    presse: page("ueber", "Presse und Aktuelles", "Neuigkeiten und Pressekontakt.", ["Meldungen", "Pressekontakt", "Bildmaterial"], "Press and news", "News and press contact.", ["News", "Press contact", "Images"]),
  },
};

function page(area, titleDe, sentenceDe, itemsDe, titleEn, sentenceEn, itemsEn) {
  return {
    area,
    de: { title: titleDe, sentence: sentenceDe, items: itemsDe },
    en: { title: titleEn, sentence: sentenceEn, items: itemsEn },
  };
}
```

`function page` steht absichtlich unter dem Objekt. Eine Funktionsdeklaration wird im Modul nach oben gezogen, der Aufruf ist gültig.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/content.test.js`

Expected: PASS, 7 tests

- [ ] **Step 5: Commit**

```bash
git init
git add package.json .gitignore src/content.js tests/content.test.js
git commit -m "$(cat <<'EOF'
feat: add UMMD navigation content for both versions

EOF
)"
```

If `git init` was already done, skip that line.

---

### Task 2: Version aus Adresse und Sitzung

**Files:**
- Create: `src/version.js`
- Test: `tests/version.test.js`

**Interfaces:**
- Consumes: nichts
- Produces: `resolveVersion(search: string, stored: string | null) => "a" | "b"`

- [ ] **Step 1: Write the failing test**

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/version.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`

- [ ] **Step 3: Write minimal implementation**

```javascript
export function resolveVersion(search, stored) {
  const value = new URLSearchParams(search).get("v");
  if (value === "a" || value === "b") return value;
  if (stored === "a" || stored === "b") return stored;
  return "a";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/version.test.js`

Expected: PASS, 2 tests

- [ ] **Step 5: Commit**

```bash
git add src/version.js tests/version.test.js
git commit -m "$(cat <<'EOF'
feat: resolve prototype version from the address

EOF
)"
```

---

### Task 3: Menümodell

**Files:**
- Create: `src/menu.js`
- Test: `tests/menu.test.js`

**Interfaces:**
- Consumes: `content` aus `src/content.js`
- Produces: `menuFor(areaId: string, version: "a" | "b", lang: "de" | "en")` ergibt `{ type: "links", items: { id: string, label: string }[] }` oder `{ type: "columns", columns: { label: string, items: { id: string, label: string }[] }[] }`

- [ ] **Step 1: Write the failing test**

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/menu.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`

- [ ] **Step 3: Write minimal implementation**

```javascript
import { content } from "./content.js";

export function menuFor(areaId, version, lang) {
  const area = content.areas.find((item) => item.id === areaId);
  if (version === "a") {
    return {
      type: "links",
      items: area.a.map((id) => ({ id, label: content.pages[id][lang].title })),
    };
  }
  return {
    type: "columns",
    columns: area.b.map((column) => ({
      label: column[lang],
      items: column.pages.map((id) => ({ id, label: content.pages[id][lang].title })),
    })),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/menu.test.js`

Expected: PASS, 2 tests

- [ ] **Step 5: Commit**

```bash
git add src/menu.js tests/menu.test.js
git commit -m "$(cat <<'EOF'
feat: build version A and B menus from content

EOF
)"
```

---

### Task 4: Seite auflösen

**Files:**
- Create: `src/pages.js`
- Test: `tests/pages.test.js`

**Interfaces:**
- Consumes: `content`
- Produces:
  - `resolveTarget(id: string | null, version: "a" | "b") => { kind: "home" } | { kind: "page", id: string } | { kind: "missing" }`
  - `areaLabel(areaId: string, lang: "de" | "en") => string`

- [ ] **Step 1: Write the failing test**

```javascript
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
  assert.equal(areaLabel("studium", "en"), "Study and teaching");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/pages.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`

- [ ] **Step 3: Write minimal implementation**

```javascript
import { content } from "./content.js";

const hubIds = new Set(Object.keys(content.hubs));

export function resolveTarget(id, version) {
  if (!id) return { kind: "home" };
  if (!content.pages[id]) return { kind: "missing" };
  if (version === "b" && hubIds.has(id)) return { kind: "home" };
  return { kind: "page", id };
}

export function areaLabel(areaId, lang) {
  if (areaId === "direkt") return content.ui[lang].areaDirekt;
  return content.areas.find((area) => area.id === areaId)[lang];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/pages.test.js`

Expected: PASS, 3 tests

- [ ] **Step 5: Commit**

```bash
git add src/pages.js tests/pages.test.js
git commit -m "$(cat <<'EOF'
feat: hide version A hub pages in version B

EOF
)"
```

---

### Task 5: Suche

**Files:**
- Create: `src/search.js`
- Test: `tests/search.test.js`

**Interfaces:**
- Consumes: `content`, `areaLabel` ist hier nicht nötig
- Produces: `searchPages(query: string, version: "a" | "b", lang: "de" | "en") => string[] | null`. `null`, wenn nach `trim` weniger als zwei Zeichen übrig sind. Sonst Seiten-Ids ohne Duplikate, in `pageOrder`. Ein Treffer, wenn die Eingabe in Titel, Satz oder einem Stichwort vorkommt, Großschreibung egal. Ein Synonym trifft zusätzlich, wenn die Eingabe den Begriff enthält oder der Begriff die Eingabe enthält.

- [ ] **Step 1: Write the failing test**

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/search.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`

- [ ] **Step 3: Write minimal implementation**

```javascript
import { content } from "./content.js";

export function searchPages(query, version, lang) {
  const needle = query.trim().toLocaleLowerCase("de");
  if (needle.length < 2) return null;
  const hubs = new Set(Object.keys(content.hubs));
  const hits = [];
  for (const id of content.pageOrder) {
    if (version === "b" && hubs.has(id)) continue;
    const copy = content.pages[id][lang];
    const haystack = [copy.title, copy.sentence, ...copy.items].join("\n").toLocaleLowerCase("de");
    const inText = haystack.includes(needle);
    const inSynonym = content.synonyms.some((synonym) => synonym.page === id && synonym.terms.some((term) => {
      const value = term.toLocaleLowerCase("de");
      return value.includes(needle) || needle.includes(value);
    }));
    if (inText || inSynonym) hits.push(id);
  }
  return hits;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/search.test.js`

Expected: PASS, 5 tests

- [ ] **Step 5: Commit**

```bash
git add src/search.js tests/search.test.js
git commit -m "$(cat <<'EOF'
feat: search page copy and synonyms

EOF
)"
```

---

### Task 6: Protokoll

**Files:**
- Create: `src/log.js`
- Test: `tests/log.test.js`

**Interfaces:**
- Consumes: nichts
- Produces:
  - `emptyLog() => { entries: [] }`
  - `record(log, entry) => log`. `entry` ohne `at` und ohne `task`. Die Funktion setzt `at` aus `now` (ISO-String) und `task` aus dem letzten Eintrag mit `type: "task"`, sonst `null`. Ein `task`-Eintrag trägt sich selbst als `task`.
  - `fileName(participant: string, day: string) => string`
  - `serialize(log) => string`

Eintragsfelder, die der Aufrufer mitgibt: `type` (`"page" | "search" | "task" | "version"`), `version`, und je nach Art `page: { path, title, origin }`, `search: { query, count }`, `taskMark: { participant, group, task }`, `versionChange: { from, to }`. `serialize` schreibt `{ participant, entries }`. `participant` ist die Kennung der letzten Aufgabenmarke oder `""`.

- [ ] **Step 1: Write the failing test**

```javascript
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
```

The filename rule: trim, empty becomes `unbenannt`, every character outside `A-Z a-z 0-9 _ -` and outside German letters `äöüÄÖÜß` becomes `-`. `"Ada L."` therefore becomes `Ada-L-` plus the extra `-` from the dot, so `Ada-L--`. The assertion above matches that rule. Do not invent a second rule.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/log.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`

- [ ] **Step 3: Write minimal implementation**

```javascript
export function emptyLog() {
  return { entries: [] };
}

export function record(log, entry, now) {
  const previous = [...log.entries].reverse().find((item) => item.type === "task");
  const task = entry.type === "task" ? entry.taskMark : (previous ? previous.taskMark : null);
  return { entries: [...log.entries, { ...entry, at: now, task }] };
}

export function fileName(participant, day) {
  const cleaned = participant.trim().replace(/[^A-Za-z0-9_äöüÄÖÜß-]/g, "-");
  return `ummd-protokoll-${cleaned || "unbenannt"}-${day}.json`;
}

export function serialize(log) {
  const taskEntry = [...log.entries].reverse().find((item) => item.type === "task");
  return JSON.stringify({
    participant: taskEntry ? taskEntry.taskMark.participant : "",
    entries: log.entries,
  }, null, 2);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/log.test.js`

Expected: PASS, 3 tests

- [ ] **Step 5: Commit**

```bash
git add src/log.js tests/log.test.js
git commit -m "$(cat <<'EOF'
feat: record the local usability session log

EOF
)"
```

---

### Task 7: Adresse

**Files:**
- Create: `src/router.js`
- Test: `tests/router.test.js`

**Interfaces:**
- Consumes: nichts
- Produces:
  - `parseRoute(hash: string) => { name: "home" } | { name: "search" } | { name: "page", id: string }`
  - `buildHash(route) => string`
  - `parseQuery(search: string) => { v: string | null, q: string }`
  - `buildQuery({ v, q }) => string` beginnt mit `?`, lässt leeres `q` weg

Routen: `""`, `"#"`, `"#/"` sind home. `"#/suche"` ist search. `"#/p/<id>"` ist page. Andere Hashes sind `{ name: "page", id: <roh> }`, damit `resolveTarget` sie als missing erkennt. `buildHash({ name: "page", id })` ergibt `#/p/<id>`.

- [ ] **Step 1: Write the failing test**

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/router.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`

- [ ] **Step 3: Write minimal implementation**

```javascript
export function parseRoute(hash) {
  const value = hash.replace(/^#/, "");
  if (value === "" || value === "/") return { name: "home" };
  if (value === "/suche") return { name: "search" };
  if (value.startsWith("/p/")) return { name: "page", id: decodeURIComponent(value.slice(3)) };
  return { name: "page", id: decodeURIComponent(value.replace(/^\//, "")) };
}

export function buildHash(route) {
  if (route.name === "search") return "#/suche";
  if (route.name === "page") return `#/p/${encodeURIComponent(route.id)}`;
  return "#/";
}

export function parseQuery(search) {
  const params = new URLSearchParams(search);
  return { v: params.get("v"), q: params.get("q") ?? "" };
}

export function buildQuery({ v, q }) {
  const params = new URLSearchParams();
  params.set("v", v);
  if (q) params.set("q", q);
  return `?${params.toString()}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/router.test.js`

Expected: PASS, 2 tests

- [ ] **Step 5: Commit**

```bash
git add src/router.js tests/router.test.js
git commit -m "$(cat <<'EOF'
feat: route pages through the address hash

EOF
)"
```

---

### Task 8: Position von Dropdown und Spaltenleiste

**Files:**
- Create: `src/layout.js`
- Test: `tests/layout.test.js`

**Interfaces:**
- Consumes: nichts
- Produces:
  - `popupOffset(anchorLeft: number, popupWidth: number, viewportWidth: number) => number` Pixel, die das Dropdown nach links rückt. `0`, wenn `anchorLeft + popupWidth` ins Fenster passt.
  - `panelOffset(panelWidth: number, viewportWidth: number) => number`. `0`, wenn die Leiste ins Fenster passt, sonst `viewportWidth - panelWidth`.

- [ ] **Step 1: Write the failing test**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { popupOffset, panelOffset } from "../src/layout.js";

test("Dropdown rückt nach links, wenn es rechts hinausliefe", () => {
  assert.equal(popupOffset(100, 200, 1000), 0);
  assert.equal(popupOffset(900, 200, 1000), -100);
});

test("Spaltenleiste bleibt im Fenster", () => {
  assert.equal(panelOffset(600, 1000), 0);
  assert.equal(panelOffset(1200, 1000), -200);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/layout.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`

- [ ] **Step 3: Write minimal implementation**

```javascript
export function popupOffset(anchorLeft, popupWidth, viewportWidth) {
  const overflow = anchorLeft + popupWidth - viewportWidth;
  return overflow > 0 ? -overflow : 0;
}

export function panelOffset(panelWidth, viewportWidth) {
  return panelWidth > viewportWidth ? viewportWidth - panelWidth : 0;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/layout.test.js`

Expected: PASS, 2 tests

- [ ] **Step 5: Commit**

```bash
git add src/layout.js tests/layout.test.js
git commit -m "$(cat <<'EOF'
feat: keep open menus inside the window

EOF
)"
```

---

### Task 9: HTML aus dem View-Model

**Files:**
- Create: `src/view.js`
- Create: `src/render.js`
- Test: `tests/render.test.js`

**Interfaces:**
- Consumes: `content`, `menuFor`, `resolveTarget`, `areaLabel`, `searchPages`
- Produces:
  - `buildView(state) => view`
  - `render(view) => string` (HTML für `#app`)
  - `state` ist `{ version, lang, route, query, openArea, moderatorOpen, moderator }`. `moderator` ist `{ participant, group, task }`. `route` ist das Ergebnis von `parseRoute`. `openArea` ist eine Bereichs-Id oder `null`.

`buildView` setzt bei `route.name === "page"` das Ziel über `resolveTarget`. Ein Hub in Version B wird zu `routeName: "home"`. Die Suche ruft `searchPages` nur bei `route.name === "search"` auf.

- [ ] **Step 1: Write the failing test**

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm install` then `node --test tests/render.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `../src/view.js`

- [ ] **Step 3: Write minimal implementation**

`src/view.js`:

```javascript
import { content } from "./content.js";
import { menuFor } from "./menu.js";
import { resolveTarget, areaLabel } from "./pages.js";
import { searchPages } from "./search.js";

export function buildView(state) {
  const copy = content.ui[state.lang];
  const target = state.route.name === "page" ? resolveTarget(state.route.id, state.version) : { kind: state.route.name };
  const routeName = target.kind === "page" ? "page" : target.kind === "missing" ? "missing" : state.route.name === "search" ? "search" : "home";
  const page = routeName === "page" ? content.pages[target.id] : null;
  const menu = state.openArea ? menuFor(state.openArea, state.version, state.lang) : null;
  const hits = routeName === "search" ? searchPages(state.query, state.version, state.lang) ?? [] : [];
  return {
    ...state,
    copy,
    routeName,
    pageId: page ? target.id : null,
    page: page ? page[state.lang] : null,
    areaName: page ? areaLabel(page.area, state.lang) : null,
    tiles: page && state.version === "a" && content.hubs[target.id]
      ? content.hubs[target.id].map((id) => ({ id, label: content.pages[id][state.lang].title }))
      : [],
    areas: content.areas.map((area) => ({ id: area.id, label: area[state.lang] })),
    level1: [
      { id: "notfall", label: content.pages.notfall[state.lang].title, emergency: true },
      { id: "kontakt", label: content.pages.kontakt[state.lang].title, emergency: false },
    ],
    home: content.home[state.lang],
    menu,
    hits: hits.map((id) => ({
      id,
      title: content.pages[id][state.lang].title,
      sentence: content.pages[id][state.lang].sentence,
      area: areaLabel(content.pages[id].area, state.lang),
    })),
  };
}
```

`src/render.js`:

```javascript
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pageLink(id, label, extraClass = "") {
  const cls = extraClass ? ` class="${extraClass}"` : "";
  return `<a href="#/p/${escapeHtml(id)}" data-page="${escapeHtml(id)}"${cls}>${escapeHtml(label)}</a>`;
}

export function render(view) {
  const menu = renderMenu(view);
  const main = renderMain(view);
  const moderator = view.moderatorOpen ? renderModerator(view) : "";
  return `<div id="testbar">
    <span>Prototyp</span>
    <button type="button" data-version="a" aria-pressed="${view.version === "a"}">Version A</button>
    <button type="button" data-version="b" aria-pressed="${view.version === "b"}">Version B</button>
    <button type="button" data-end>Test beenden</button>
  </div>
  <header>
    <a href="#/" data-home>UMMD</a>
    ${pageLink("notfall", view.level1[0].label, "is-emergency")}
    <form data-search-form>
      <input data-search aria-label="${escapeHtml(view.copy.searchLabel)}" value="${escapeHtml(view.routeName === "search" ? view.query : "")}">
      <button type="submit">${escapeHtml(view.copy.searchButton)}</button>
    </form>
    ${pageLink("kontakt", view.level1[1].label)}
    <button type="button" data-lang="de" aria-pressed="${view.lang === "de"}">DE</button>
    <button type="button" data-lang="en" aria-pressed="${view.lang === "en"}">EN</button>
  </header>
  <nav>
    ${view.areas.map((area) => `<button type="button" data-area="${area.id}" aria-expanded="${view.openArea === area.id}">${escapeHtml(area.label)}</button>`).join("")}
  </nav>
  ${menu}
  <main id="page">${main}</main>
  ${moderator}`;
}

function renderMenu(view) {
  if (!view.menu) return "";
  if (view.menu.type === "links") {
    return `<div data-popup>${view.menu.items.map((item) => pageLink(item.id, item.label)).join("")}</div>`;
  }
  const columns = view.menu.columns.map((column) => `<section><h2>${escapeHtml(column.label)}</h2>${column.items.map((item) => pageLink(item.id, item.label)).join("")}</section>`).join("");
  return `<div data-panel>${columns}</div>`;
}

function renderMain(view) {
  if (view.routeName === "missing") {
    return `<p>${escapeHtml(view.copy.missing)}</p><p><a href="#/" data-home>${escapeHtml(view.copy.homeLink)}</a></p>`;
  }
  if (view.routeName === "search") {
    if (view.hits.length === 0) return `<p>${escapeHtml(view.copy.noResults)} ${escapeHtml(view.query)}</p>`;
    return view.hits.map((hit) => `<article data-result="${escapeHtml(hit.id)}"><h2><a href="#/p/${escapeHtml(hit.id)}" data-page="${escapeHtml(hit.id)}" data-origin="Suche">${escapeHtml(hit.title)}</a></h2><p>${escapeHtml(hit.area)}</p><p>${escapeHtml(hit.sentence)}</p></article>`).join("");
  }
  if (view.routeName === "home") return `<h1>${escapeHtml(view.home.title)}</h1><p>${escapeHtml(view.home.sentence)}</p>`;
  const tiles = view.tiles.map((tile) => `<a class="tile" href="#/p/${escapeHtml(tile.id)}" data-page="${escapeHtml(tile.id)}" data-origin="Kachel">${escapeHtml(tile.label)}</a>`).join("");
  const items = view.page.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `<h1>${escapeHtml(view.page.title)}</h1><p>${escapeHtml(view.page.sentence)}</p>${tiles ? `<div class="tiles">${tiles}</div>` : ""}<h2>${escapeHtml(view.copy.onThisPage)}</h2><ul>${items}</ul>`;
}

function renderModerator(view) {
  const field = view.moderator;
  return `<form data-moderator>
    <label>Teilnehmerkennung <input name="participant" value="${escapeHtml(field.participant)}"></label>
    <label>Nutzergruppe <input name="group" value="${escapeHtml(field.group)}"></label>
    <label>Aufgabenname <input name="task" value="${escapeHtml(field.task)}"></label>
    <button type="button" data-mark>Marke setzen</button>
  </form>`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/render.test.js`

Expected: PASS, 6 tests

- [ ] **Step 5: Commit**

```bash
git add src/view.js src/render.js tests/render.test.js package-lock.json
git commit -m "$(cat <<'EOF'
feat: render both navigation versions from a view model

EOF
)"
```

---

### Task 10: Verhalten, Protokoll und Hülle

**Files:**
- Create: `src/app.js`
- Create: `index.html`
- Create: `styles.css`
- Test: `tests/app.test.js`

**Interfaces:**
- Consumes: `content`, `resolveVersion`, `buildView`, `render`, `parseRoute`, `buildHash`, `parseQuery`, `buildQuery`, `searchPages`, `emptyLog`, `record`, `fileName`, `serialize`, `popupOffset`, `panelOffset`
- Produces: `mount(document, window, deps?)`. `deps` darf `storageLocal`, `storageSession`, `now`, `download` ersetzen. Ohne `deps` nutzt die Seite `localStorage` für das Protokoll, `sessionStorage` für Version, Sprache und Moderationsfelder, `new Date()` und einen echten Datei-Download.

Speicherkeys: `ummd-log`, `ummd-version`, `ummd-lang`, `ummd-moderator`.

- [ ] **Step 1: Write the failing test**

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { mount } from "../src/app.js";

function start(hash = "#/", search = "") {
  const { document, window } = parseHTML("<!doctype html><div id=\"app\"></div>");
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

test("Dropdown öffnet per Klick und eine Kachel wechselt die Seite", () => {
  const app = start();
  app.document.querySelector("[data-area='studium']").click();
  assert.ok(app.document.querySelector("[data-popup]"));
  app.document.querySelector("[data-page='studierende']").click();
  assert.equal(app.document.querySelector("h1").textContent, "Für Studierende");
  assert.equal(app.document.querySelector("[data-popup]"), null);
  const log = JSON.parse(app.local.get("ummd-log"));
  assert.equal(log.entries.at(-1).page.origin, "Menü");
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
  app.document.querySelector("[data-lang='en']").click();
  assert.match(app.document.querySelector("[data-result='moodle']").textContent, /learning platform/i);
  app.window.dispatchEvent(new app.window.KeyboardEvent("keydown", { key: "M", shiftKey: true }));
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/app.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `../src/app.js`

- [ ] **Step 3: Write minimal implementation**

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>UMMD Navigationsprototyp</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="src/app.js"></script>
</body>
</html>
```

Create `styles.css`. Keep it structural: a yellow test bar, black emergency chip, a narrow popup, a panel only as wide as its columns, tiles in a row. No decorative imagery.

```css
* { box-sizing: border-box; }
body { margin: 0; font: 16px/1.4 system-ui, sans-serif; color: #222; }
#testbar { display: flex; gap: 8px; align-items: center; padding: 6px 12px; background: #fff4cc; }
header, nav { display: flex; gap: 8px; align-items: center; padding: 8px 12px; background: #f4f4f4; }
a.is-emergency { background: #111; color: #fff; border-radius: 999px; padding: 2px 10px; text-decoration: none; }
nav button[aria-expanded="true"] { background: #111; color: #fff; }
[data-popup] { display: inline-flex; flex-direction: column; margin: 8px 12px; padding: 6px 0; border: 1px solid #111; background: #fff; min-width: 220px; }
[data-popup] a { padding: 4px 12px; }
[data-panel] { display: flex; width: max-content; max-width: none; border-bottom: 2px solid #111; background: #fff; }
[data-panel] section { padding: 12px 16px; min-width: 180px; }
[data-panel] h2 { margin: 0 0 8px; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; color: #777; }
main { padding: 16px; }
.tiles { display: flex; gap: 8px; flex-wrap: wrap; }
.tile { display: block; border: 1px solid #bbb; padding: 10px; min-width: 180px; background: #fafafa; color: inherit; }
[data-moderator] { position: fixed; right: 12px; bottom: 12px; padding: 12px; background: #fff; border: 1px solid #111; display: grid; gap: 8px; }
```

Create `src/app.js`:

```javascript
import { resolveVersion } from "./version.js";
import { buildView } from "./view.js";
import { render } from "./render.js";
import { parseRoute, buildHash, parseQuery, buildQuery } from "./router.js";
import { searchPages } from "./search.js";
import { content } from "./content.js";
import { emptyLog, record, fileName, serialize } from "./log.js";
import { popupOffset, panelOffset } from "./layout.js";

const KEYS = { log: "ummd-log", version: "ummd-version", lang: "ummd-lang", moderator: "ummd-moderator" };

export function mount(document, window, deps = {}) {
  const local = deps.storageLocal ?? window.localStorage;
  const session = deps.storageSession ?? window.sessionStorage;
  const now = deps.now ?? (() => new Date());
  const download = deps.download ?? defaultDownload;
  const savedLog = local.getItem(KEYS.log);
  const state = {
    version: resolveVersion(window.location.search, session.getItem(KEYS.version)),
    lang: session.getItem(KEYS.lang) === "en" ? "en" : "de",
    route: parseRoute(window.location.hash),
    query: parseQuery(window.location.search).q,
    openArea: null,
    moderatorOpen: false,
    moderator: JSON.parse(session.getItem(KEYS.moderator) || "{\"participant\":\"\",\"group\":\"\",\"task\":\"\"}"),
    log: savedLog ? JSON.parse(savedLog) : emptyLog(),
    origin: "direkte Adresse",
    loggedKey: null,
    writing: false,
  };

  function visitKey() {
    const query = state.route.name === "search" ? state.query : "";
    return `${buildHash(state.route)}|${query}`;
  }

  function persist() {
    local.setItem(KEYS.log, JSON.stringify(state.log));
    session.setItem(KEYS.version, state.version);
    session.setItem(KEYS.lang, state.lang);
    session.setItem(KEYS.moderator, JSON.stringify(state.moderator));
  }

  function writeAddress(mode) {
    state.writing = true;
    const query = buildQuery({ v: state.version, q: state.route.name === "search" ? state.query : "" });
    const hash = buildHash(state.route);
    const next = `${window.location.pathname}${query}${hash}`;
    if (mode === "replace") window.history.replaceState(null, "", next);
    else window.history.pushState(null, "", next);
    window.location.hash = hash;
    window.location.search = query;
    state.writing = false;
  }

  function go(route, origin, mode = "push") {
    state.route = route;
    state.origin = origin;
    state.openArea = null;
    writeAddress(mode);
    draw();
  }

  function draw() {
    if (state.route.name === "page" && state.version === "b" && content.hubs[state.route.id]) {
      state.route = { name: "home" };
      writeAddress("replace");
    }
    document.querySelector("#app").innerHTML = render(buildView(state));
    placeMenus();
    logVisit();
    persist();
  }

  function boxOf(node) {
    if (!node || typeof node.getBoundingClientRect !== "function") return { left: 0, width: 0 };
    return node.getBoundingClientRect();
  }

  function placeMenus() {
    const popup = document.querySelector("[data-popup]");
    const anchor = state.openArea ? document.querySelector(`[data-area="${state.openArea}"]`) : null;
    if (popup && anchor) {
      const anchorBox = boxOf(anchor);
      const popupBox = boxOf(popup);
      popup.style.marginLeft = `${popupOffset(anchorBox.left, popupBox.width || 220, window.innerWidth)}px`;
    }
    const panel = document.querySelector("[data-panel]");
    if (panel) panel.style.marginLeft = `${panelOffset(boxOf(panel).width || 0, window.innerWidth)}px`;
  }

  function logVisit() {
    const key = visitKey();
    if (key === state.loggedKey) return;
    state.loggedKey = key;
    const at = now().toISOString();
    if (state.route.name === "search") {
      const hits = searchPages(state.query, state.version, state.lang) ?? [];
      state.log = record(state.log, { type: "search", version: state.version, search: { query: state.query, count: hits.length } }, at);
      return;
    }
    const view = buildView(state);
    const title = view.routeName === "page" ? view.page.title : view.routeName === "missing" ? view.copy.missing : view.home.title;
    state.log = record(state.log, {
      type: "page",
      version: state.version,
      page: { path: buildHash(state.route), title, origin: state.origin },
    }, at);
    state.origin = "direkte Adresse";
  }

  document.querySelector("#app").addEventListener("click", (event) => {
    const version = event.target.closest("[data-version]");
    if (version) {
      const from = state.version;
      state.version = version.dataset.version;
      state.log = record(state.log, { type: "version", version: state.version, versionChange: { from, to: state.version } }, now().toISOString());
      state.origin = "direkte Adresse";
      writeAddress("replace");
      draw();
      return;
    }
    const lang = event.target.closest("[data-lang]");
    if (lang) { state.lang = lang.dataset.lang; draw(); return; }
    const area = event.target.closest("[data-area]");
    if (area) { state.openArea = state.openArea === area.dataset.area ? null : area.dataset.area; draw(); return; }
    const page = event.target.closest("[data-page]");
    if (page) { go({ name: "page", id: page.dataset.page }, page.dataset.origin || "Menü"); return; }
    if (event.target.closest("[data-home]")) { go({ name: "home" }, "Logo"); return; }
    if (event.target.closest("#page")) { state.openArea = null; draw(); return; }
    if (event.target.closest("[data-mark]")) {
      const form = document.querySelector("[data-moderator]");
      state.moderator = {
        participant: form.participant.value,
        group: form.group.value,
        task: form.task.value,
      };
      state.log = record(state.log, { type: "task", version: state.version, taskMark: state.moderator }, now().toISOString());
      persist();
      return;
    }
    if (event.target.closest("[data-end]")) {
      const day = now().toISOString().slice(0, 10);
      download(fileName(state.moderator.participant, day), serialize(state.log));
    }
  });

  document.querySelector("#app").addEventListener("submit", (event) => {
    if (!event.target.matches("[data-search-form]")) return;
    event.preventDefault();
    const query = event.target.querySelector("[data-search]").value;
    if (searchPages(query, state.version, state.lang) === null) return;
    state.query = query.trim();
    go({ name: "search" }, "direkte Adresse");
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "M" && event.shiftKey) state.moderatorOpen = !state.moderatorOpen;
    else return;
    draw();
  });

  window.addEventListener("hashchange", () => {
    if (state.writing) return;
    const route = parseRoute(window.location.hash);
    if (route.name === state.route.name && route.id === state.route.id) return;
    state.route = route;
    state.origin = "direkte Adresse";
    draw();
  });

  draw();
}

function defaultDownload(name, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/app.test.js`

Expected: PASS, 4 tests

Then run: `node --test`

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/app.js index.html styles.css tests/app.test.js
git commit -m "$(cat <<'EOF'
feat: wire navigation, search, and the local session log

EOF
)"
```

---

### Task 11: Prüfung gegen die Spec

**Files:**
- Modify: keine

**Interfaces:**
- Consumes: die laufende Seite aus Task 10
- Produces: keine neuen Symbole. Die manuelle Liste aus der Spec ist durchgespielt.

- [ ] **Step 1: Start the static server**

Run: `python3 -m http.server 8765`

Open `http://localhost:8765/?v=a#/`

- [ ] **Step 2: Walk the spec checklist**

Confirm each line. Fix the code if one fails, then re-run `node --test`.

- Version A: every dropdown entry opens its page, every tile opens its child, the menu row stays in place.
- Version B: columns match the table in Task 1, headings are not links, a pasted hub address such as `#/p/studierende` shows the home page.
- Ebene 1 is present on a child page, on the results page, and on the home page.
- Search finds `Fachschaft`, `Notaufnahme`, and `Bewerbung`. `xyzxyz` shows `Keine Treffer für xyzxyz`.
- DE/EN switches visible site copy. No `&` is visible. The test bar stays German.
- Switching version and reloading keeps the version.
- `Shift+M` sets a mark. `Test beenden` downloads a file that contains a page view, a search term, and the mark. The browser network panel shows no request caused by that download.

- [ ] **Step 3: Commit only if Step 2 changed files**

```bash
git add -u
git commit -m "$(cat <<'EOF'
fix: align the prototype with the manual test checklist

EOF
)"
```
