import { content } from "./content.js";
import { menuFor } from "./menu.js";
import { resolveTarget, areaLabel } from "./pages.js";
import { searchPages } from "./search.js";

function breadcrumbs(id, version, lang) {
  const page = content.pages[id];
  const crumbs = [{ kind: "home", label: content.ui[lang].breadcrumbHome }];
  if (page.area !== "direkt") crumbs.push({ kind: "area", label: areaLabel(page.area, lang) });
  const hub = version === "a" ? Object.keys(content.hubs).find((hubId) => content.hubs[hubId].includes(id)) : null;
  if (hub) crumbs.push({ kind: "page", id: hub, label: content.pages[hub][lang].title });
  crumbs.push({ kind: "current", label: page[lang].title });
  return crumbs;
}

export function buildView(state) {
  const copy = content.ui[state.lang];
  const target = state.route.name === "page" ? resolveTarget(state.route.id, state.version) : { kind: state.route.name };
  const routeName = target.kind === "page" ? "page" : target.kind === "missing" ? "missing" : state.route.name === "search" ? "search" : "home";
  const page = routeName === "page" ? content.pages[target.id] : null;
  const hits = routeName === "search" ? searchPages(state.query, state.version, state.lang) ?? [] : [];
  const tileIds = page && state.version === "a" ? content.hubs[target.id] ?? [] : [];
  const tileTitles = new Set(tileIds.map((id) => content.pages[id][state.lang].title));
  return {
    ...state,
    copy,
    routeName,
    pageId: page ? target.id : null,
    page: page ? page[state.lang] : null,
    crumbs: page ? breadcrumbs(target.id, state.version, state.lang) : null,
    currentArea: page ? page.area : null,
    tiles: tileIds.map((id) => ({
      id,
      label: content.pages[id][state.lang].title,
      sentence: content.pages[id][state.lang].sentence,
    })),
    sections: page ? page[state.lang].items.filter((item) => !tileTitles.has(item)) : [],
    areas: content.areas.map((area) => ({
      id: area.id,
      label: area[state.lang],
      menu: menuFor(area.id, state.version, state.lang),
    })),
    level1: [
      { id: "notfall", label: content.pages.notfall[state.lang].title, emergency: true },
      { id: "kontakt", label: content.pages.kontakt[state.lang].title, emergency: false },
      { id: "anfahrt", label: content.pages.anfahrt[state.lang].title, emergency: false },
    ],
    home: content.home[state.lang],
    hits: hits.map((id) => ({
      id,
      title: content.pages[id][state.lang].title,
      sentence: content.pages[id][state.lang].sentence,
      area: areaLabel(content.pages[id].area, state.lang),
    })),
  };
}
