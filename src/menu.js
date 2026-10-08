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
