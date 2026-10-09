import { resolveVersion } from "./version.js";
import { buildView } from "./view.js";
import { render } from "./render.js";
import { parseRoute, buildHash, parseQuery, buildQuery } from "./router.js";
import { searchPages } from "./search.js";
import { content } from "./content.js";
import { emptyLog, record, fileName, serialize } from "./log.js";
import { popupOffset } from "./layout.js";
import { hiddenInVersion } from "./pages.js";

const KEYS = { log: "ummd-log", recording: "ummd-recording", version: "ummd-version", lang: "ummd-lang", moderator: "ummd-moderator", testbarHidden: "ummd-testbar-hidden" };
const CLOSE_DELAY = 250;

export function mount(document, window, deps = {}) {
  const local = deps.storageLocal ?? window.localStorage;
  const session = deps.storageSession ?? window.sessionStorage;
  const now = deps.now ?? (() => new Date());
  const download = deps.download ?? defaultDownload(document);
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
    recording: local.getItem(KEYS.recording) === "true",
    testbarHidden: session.getItem(KEYS.testbarHidden) === "true",
    langOpen: false,
    origin: "direkte Adresse",
    loggedKey: null,
    writing: false,
  };
  let closeTimer = null;

  function visitKey() {
    const query = state.route.name === "search" ? state.query : "";
    return `${buildHash(state.route)}|${query}`;
  }

  function log(entry) {
    if (!state.recording) return;
    state.log = record(state.log, entry, now().toISOString());
  }

  function persist() {
    local.setItem(KEYS.log, JSON.stringify(state.log));
    local.setItem(KEYS.recording, String(state.recording));
    session.setItem(KEYS.version, state.version);
    session.setItem(KEYS.lang, state.lang);
    session.setItem(KEYS.testbarHidden, String(state.testbarHidden));
    session.setItem(KEYS.moderator, JSON.stringify(state.moderator));
  }

  function writeAddress(mode) {
    state.writing = true;
    const query = buildQuery({ v: state.version, q: state.route.name === "search" ? state.query : "" });
    const hash = buildHash(state.route);
    const next = `${window.location.pathname}${query}${hash}`;
    if (typeof window.history?.replaceState === "function") {
      if (mode === "replace") window.history.replaceState(null, "", next);
      else window.history.pushState(null, "", next);
    }
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
    if (state.route.name === "page" && hiddenInVersion(state.route.id, state.version)) {
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

  function openMenu(area) {
    clearTimeout(closeTimer);
    if (state.openArea === area) return;
    state.openArea = area;
    showMenu();
  }

  function closeMenu() {
    clearTimeout(closeTimer);
    if (!state.openArea) return;
    state.openArea = null;
    showMenu();
  }

  function setLangOpen(open) {
    state.langOpen = open;
    const menu = document.querySelector("[data-lang-menu]");
    if (menu) menu.hidden = !open;
    document.querySelector("[data-lang-toggle]")?.setAttribute("aria-expanded", String(open));
  }

  function showMenu() {
    document.querySelectorAll("[data-menu]").forEach((menu) => { menu.hidden = menu.dataset.menu !== state.openArea; });
    document.querySelectorAll("[data-area]").forEach((button) => button.setAttribute("aria-expanded", String(button.dataset.area === state.openArea)));
    placeMenus();
  }

  function placeMenus() {
    const menu = state.openArea ? document.querySelector(`[data-menu="${state.openArea}"]`) : null;
    const anchor = state.openArea ? document.querySelector(`[data-area="${state.openArea}"]`) : null;
    const wrap = document.querySelector(".navwrap");
    if (!menu || !anchor || !wrap) return;
    menu.style.left = "0px";
    menu.style.maxWidth = "";
    const wrapBox = boxOf(wrap);
    const anchorLeft = boxOf(anchor).left - wrapBox.left;
    const menuWidth = boxOf(menu).width;
  const room = (wrapBox.width || window.innerWidth) - 8;
  const left = Math.max(8, anchorLeft + popupOffset(anchorLeft, menuWidth, room));
    menu.style.left = `${left}px`;
    menu.style.maxWidth = `${room - left}px`;
  }

  function logVisit() {
    const key = visitKey();
    if (key === state.loggedKey) return;
    state.loggedKey = key;
    if (state.route.name === "search") {
      const hits = searchPages(state.query, state.version, state.lang) ?? [];
      log({ type: "search", version: state.version, search: { query: state.query, count: hits.length } });
      return;
    }
    const view = buildView(state);
    const title = view.routeName === "page" ? view.page.title : view.routeName === "missing" ? view.copy.missing : view.home.title;
    log({
      type: "page",
      version: state.version,
      page: { path: buildHash(state.route), title, origin: state.origin },
    });
    state.origin = "direkte Adresse";
  }

  document.querySelector("#app").addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-testbar-hide], [data-testbar-show]");
    if (toggle) {
      state.testbarHidden = toggle.matches("[data-testbar-hide]");
      draw();
      return;
    }
    if (event.target.closest("[data-lang-toggle]")) { setLangOpen(!state.langOpen); return; }
    const lang = event.target.closest("[data-lang]");
    if (lang) {
      state.lang = lang.dataset.lang === "en" ? "en" : "de";
      state.langOpen = false;
      draw();
      return;
    }
    if (state.langOpen) setLangOpen(false);
    const version = event.target.closest("[data-version]");
    if (version) {
      const from = state.version;
      state.version = version.dataset.version;
      log({ type: "version", version: state.version, versionChange: { from, to: state.version } });
      state.origin = "direkte Adresse";
      writeAddress("replace");
      draw();
      return;
    }
    const area = event.target.closest("[data-area]");
    if (area) { openMenu(area.dataset.area); return; }
    const page = event.target.closest("[data-page]");
    if (page) { go({ name: "page", id: page.dataset.page }, page.dataset.origin || "Menü"); return; }
    const home = event.target.closest("[data-home]");
    if (home) { go({ name: "home" }, home.dataset.origin || "Logo"); return; }
    if (event.target.closest("#page")) { closeMenu(); return; }
    if (event.target.closest("[data-mark]")) {
      const form = document.querySelector("[data-moderator]");
      state.moderator = {
        participant: form.querySelector("[name=participant]").value,
        group: form.querySelector("[name=group]").value,
        task: form.querySelector("[name=task]").value,
      };
      log({ type: "task", version: state.version, taskMark: state.moderator });
      persist();
      return;
    }
    if (event.target.closest("[data-start]")) {
      state.log = emptyLog();
      state.recording = true;
      log({ type: "start", version: state.version });
      state.loggedKey = null;
      state.origin = "Teststart";
      draw();
      return;
    }
    if (event.target.closest("[data-end]")) {
      log({ type: "end", version: state.version });
      state.recording = false;
      const day = now().toISOString().slice(0, 10);
      download(fileName(state.moderator.participant, day), serialize(state.log));
      draw();
    }
  });

  document.querySelector("#app").addEventListener("submit", (event) => {
    if (event.target.matches("[data-finder-form]")) {
      event.preventDefault();
      const query = event.target.querySelector("[data-finder]").value.trim();
      if (query) log({ type: "sprechstunde", version: state.version, search: { query } });
      persist();
      return;
    }
    if (!event.target.matches("[data-search-form]")) return;
    event.preventDefault();
    const query = event.target.querySelector("[data-search]").value;
    if (searchPages(query, state.version, state.lang) === null) return;
    state.query = query.trim();
    go({ name: "search" }, "direkte Adresse");
  });

  document.querySelector("#app").addEventListener("mouseover", (event) => {
    const area = event.target.closest("[data-area]");
    if (area) openMenu(area.dataset.area);
    else if (event.target.closest(".navwrap")) clearTimeout(closeTimer);
  });

  document.querySelector("#app").addEventListener("mouseout", (event) => {
    if (!event.target.closest(".navwrap")) return;
    if (event.relatedTarget && event.relatedTarget.closest && event.relatedTarget.closest(".navwrap")) return;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(closeMenu, CLOSE_DELAY);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { closeMenu(); setLangOpen(false); return; }
    if (!(event.key === "M" && event.shiftKey)) return;
    state.moderatorOpen = !state.moderatorOpen;
    draw();
  });

  window.addEventListener("resize", placeMenus);

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

function defaultDownload(document) {
  return (name, text) => {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };
}
