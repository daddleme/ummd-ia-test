import { content } from "./content.js";
import { menuFor } from "./menu.js";
import { resolveTarget, areaLabel, pageCopy } from "./pages.js";
import { searchPages } from "./search.js";

function breadcrumbs(id, version, lang) {
  const page = content.pages[id];
  const crumbs = [{ kind: "home", label: content.ui[lang].breadcrumbHome }];
  if (page.area !== "direkt") crumbs.push({ kind: "area", label: areaLabel(page.area, lang) });
  const hub = version === "a" ? Object.keys(content.hubs).find((hubId) => content.hubs[hubId].includes(id)) : null;
  if (hub) crumbs.push({ kind: "page", id: hub, label: pageCopy(hub, version, lang).title });
  crumbs.push({ kind: "current", label: pageCopy(id, version, lang).title });
  return crumbs;
}

export function buildView(state) {
  const copy = content.ui[state.lang];
  const target = state.route.name === "page" ? resolveTarget(state.route.id, state.version) : { kind: state.route.name };
  const routeName = target.kind === "page" ? "page" : target.kind === "missing" ? "missing" : state.route.name === "search" ? "search" : "home";
  const page = routeName === "page" ? content.pages[target.id] : null;
  const pageText = page ? pageCopy(target.id, state.version, state.lang) : null;
  const hits = routeName === "search" ? searchPages(state.query, state.version, state.lang) ?? [] : [];
  const tileIds = page && state.version === "a" ? content.hubs[target.id] ?? [] : [];
  const textOf = (id) => pageCopy(id, state.version, state.lang);
  const tileTitles = new Set(tileIds.map((id) => textOf(id).title));
  return {
    ...state,
    copy,
    routeName,
    pageId: page ? target.id : null,
    page: pageText,
    crumbs: page ? breadcrumbs(target.id, state.version, state.lang) : null,
    finder: Boolean(page && page.finder),
    currentArea: page ? page.area : null,
    tiles: tileIds.map((id) => ({
      id,
      label: textOf(id).title,
      sentence: textOf(id).sentence,
    })),
    sections: pageText ? pageText.items.filter((item) => !tileTitles.has(item)) : [],
    areas: content.areas.map((area) => ({
      id: area.id,
      label: area[state.lang],
      menu: menuFor(area.id, state.version, state.lang),
    })),
    level1: [
      { id: "notfall", label: textOf("notfall").title, emergency: true },
      { id: "kontakt", label: textOf("kontakt").title, emergency: false },
      { id: "anfahrt", label: textOf("anfahrt").title, emergency: false },
    ],
    home: content.home[state.lang],
    hits: hits.map((id) => ({
      id,
      title: textOf(id).title,
      sentence: textOf(id).sentence,
      area: areaLabel(content.pages[id].area, state.lang),
    })),
  };
}
