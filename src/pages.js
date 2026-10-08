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
