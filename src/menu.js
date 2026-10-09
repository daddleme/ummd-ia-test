import { content } from "./content.js";
import { pageCopy } from "./pages.js";

export function menuFor(areaId, version, lang) {
  const area = content.areas.find((item) => item.id === areaId);
  if (version === "a") {
    return {
      type: "links",
      items: area.a.map((id) => ({ id, label: pageCopy(id, version, lang).title })),
    };
  }
  return {
    type: "columns",
    columns: area.b.map((column) => ({
      label: column[lang],
      items: column.pages.map((id) => ({ id, label: pageCopy(id, version, lang).title })),
      cta: column.cta ? { id: column.cta, label: pageCopy(column.cta, version, lang).title } : null,
    })),
  };
}
