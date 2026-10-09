const TARGETS = [
  { selector: "[data-area]", bereich: "Hauptmenü" },
  { selector: "[data-panel] a", bereich: "Mega-Menü" },
  { selector: "[data-popup] a", bereich: "Dropdown" },
  { selector: ".logo", bereich: "Logo", label: "Logo" },
  { selector: "[data-search-form]", bereich: "Kopfzeile", label: "Suche" },
  { selector: "[data-lang-toggle], [data-lang]", bereich: "Kopfzeile", label: "Sprache" },
  { selector: ".tools a", bereich: "Kopfzeile" },
  { selector: ".crumbs a", bereich: "Brotkrumen" },
  { selector: ".tile", bereich: "Kachel" },
  { selector: "[data-result] a", bereich: "Suchergebnis" },
  { selector: "[data-finder-form]", bereich: "Sprechstunden-Suche", label: "Sprechstunden-Suche" },
];

export const HOVER_MIN_MS = 300;

export function hoverTarget(node) {
  if (!node?.closest) return null;
  for (const target of TARGETS) {
    const element = node.closest(target.selector);
    if (element) return { node: element, bereich: target.bereich, element: target.label ?? labelOf(element) };
  }
  return null;
}

function labelOf(element) {
  const source = element.querySelector?.("strong") ?? element;
  return source.textContent.replace(/\s+/g, " ").trim();
}
