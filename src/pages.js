import { content } from "./content.js";

const hubIds = new Set(Object.keys(content.hubs));

export function pageCopy(id, version, lang) {
  const page = content.pages[id];
  return { ...page[lang], ...(page.versions?.[version]?.[lang] ?? {}) };
}

export function hiddenInVersion(id, version) {
  if (version === "b" && hubIds.has(id)) return true;
  const only = content.versionOnly[id];
  return Boolean(only && only !== version);
}

export function resolveTarget(id, version) {
  if (!id) return { kind: "home" };
  if (!content.pages[id]) return { kind: "missing" };
  if (hiddenInVersion(id, version)) return { kind: "home" };
  return { kind: "page", id };
}

export function areaLabel(areaId, lang) {
  if (areaId === "direkt") return content.ui[lang].areaDirekt;
  return content.areas.find((area) => area.id === areaId)[lang];
}
