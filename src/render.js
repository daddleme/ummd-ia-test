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
  const menus = view.areas.map((area) => renderMenu(area, view.openArea === area.id)).join("");
  const main = renderMain(view);
  const moderator = view.moderatorOpen ? renderModerator(view) : "";
  const langLabel = view.lang === "en" ? "Language" : "Sprache";
  return `${renderTestbar(view)}
  <header>
    <div class="topline">
      <a class="logo" href="#/" data-home>
        <span class="logo-mark" aria-hidden="true"></span>
        <span class="logo-text"><strong>UMMD</strong><small>Universitätsmedizin Magdeburg</small></span>
      </a>
      <div class="tools">
        <form data-search-form role="search">
          ${SEARCH_ICON}
          <input data-search aria-label="${escapeHtml(view.copy.searchLabel)}" placeholder="${escapeHtml(view.copy.searchLabel)}" value="${escapeHtml(view.routeName === "search" ? view.query : "")}">
          <button type="submit" aria-label="${escapeHtml(view.copy.searchButton)}" title="${escapeHtml(view.copy.searchButton)}">${ARROW_RIGHT}</button>
        </form>
        ${pageLink("anfahrt", view.level1[2].label, "quiet")}
        ${pageLink("kontakt", view.level1[1].label, "quiet")}
        ${pageLink("notfall", view.level1[0].label, "is-emergency")}
        <div class="langswitch">
          <button type="button" data-lang-toggle aria-haspopup="true" aria-expanded="${Boolean(view.langOpen)}" aria-label="${escapeHtml(langLabel)}" title="${escapeHtml(langLabel)}">${GLOBE_ICON}<span>${view.lang.toUpperCase()}</span>${CHEVRON_DOWN}</button>
          <div class="langmenu" data-lang-menu${view.langOpen ? "" : " hidden"}>
            ${LANGUAGES.map((item) => `<button type="button" data-lang="${item.id}" aria-pressed="${view.lang === item.id}">${item.label}</button>`).join("")}
          </div>
        </div>
      </div>
    </div>
    <div class="navrow"><div class="navwrap">
      <nav>
        ${view.areas.map((area) => `<button type="button" data-area="${area.id}" aria-expanded="${view.openArea === area.id}"${view.currentArea === area.id ? ' aria-current="true"' : ""}>${escapeHtml(area.label)}${CHEVRON_DOWN}</button>`).join("")}
      </nav>
      ${menus}
    </div></div>
  </header>
  <main id="page">${main}</main>
  ${moderator}`;
}

const SEARCH_ICON = `<svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const ARROW_RIGHT = `<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const GLOBE_ICON = `<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6.3"/><ellipse cx="8" cy="8" rx="2.6" ry="6.3"/><path d="M1.9 6h12.2M1.9 10h12.2"/></g></svg>`;
const LANGUAGES = [
  { id: "de", label: "Deutsch" },
  { id: "en", label: "English" },
];
const CHEVRON_UP = `<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 8l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;
const CHEVRON_DOWN = `<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;

function renderTestbar(view) {
  if (view.testbarHidden) {
    return `<button type="button" class="testbar-show${view.recording ? " is-recording" : ""}" data-testbar-show aria-label="Testleiste einblenden" title="Testleiste einblenden">${CHEVRON_DOWN}</button>`;
  }
  return `<div id="testbar">
    <span>Prototyp</span>
    <div class="segment" role="group" aria-label="Version">
      <button type="button" data-version="a" aria-pressed="${view.version === "a"}">Version A</button>
      <button type="button" data-version="b" aria-pressed="${view.version === "b"}">Version B</button>
    </div>
    <div class="session">
      <span data-status${view.recording ? ' class="is-recording"' : ""}>${view.recording ? "Aufzeichnung läuft" : "Keine Aufzeichnung"}</span>
      <button type="button" data-start${view.recording ? " disabled" : ""}>Test starten</button>
      <button type="button" data-end${view.recording || view.log?.entries.length ? "" : " disabled"}>Test beenden</button>
      <button type="button" class="testbar-hide" data-testbar-hide aria-label="Testleiste ausblenden" title="Testleiste ausblenden">${CHEVRON_UP}</button>
    </div>
  </div>`;
}

function renderMenu(area, open) {
  const attrs = `data-menu="${area.id}"${open ? "" : " hidden"}`;
  if (area.menu.type === "links") {
    return `<div data-popup ${attrs}>${area.menu.items.map((item) => pageLink(item.id, item.label)).join("")}</div>`;
  }
  const columns = area.menu.columns.map((column) => `<section><h2>${escapeHtml(column.label)}</h2>${column.items.map((item) => pageLink(item.id, item.label)).join("")}</section>`).join("");
  return `<div data-panel ${attrs}>${columns}</div>`;
}

function renderMain(view) {
  if (view.routeName === "missing") {
    return `<p>${escapeHtml(view.copy.missing)}</p><p><a href="#/" data-home>${escapeHtml(view.copy.homeLink)}</a></p>`;
  }
  if (view.routeName === "search") {
    if (view.hits.length === 0) return `<p>${escapeHtml(view.copy.noResults)} ${escapeHtml(view.query)}</p>`;
    return view.hits.map((hit) => `<article data-result="${escapeHtml(hit.id)}"><h2><a href="#/p/${escapeHtml(hit.id)}" data-page="${escapeHtml(hit.id)}" data-origin="Suche">${escapeHtml(hit.title)}</a></h2><p>${escapeHtml(hit.area)}</p><p>${escapeHtml(hit.sentence)}</p></article>`).join("");
  }
  if (view.routeName === "home") {
    return `${renderHero(view.home.title, "")}<div class="sk-grid">${[1, 2, 3, 4].map(() => renderCard("")).join("")}</div>${SKELETON_BAND}`;
  }
  const tiles = view.tiles.map((tile) => `<a class="tile" href="#/p/${escapeHtml(tile.id)}" data-page="${escapeHtml(tile.id)}" data-origin="Kachel"><strong>${escapeHtml(tile.label)}</strong><span class="sk" aria-hidden="true"></span><span class="sk sk-short" aria-hidden="true"></span></a>`).join("");
  const cards = view.sections.map((item) => renderCard(item)).join("");
  const sections = cards ? `<h2>${escapeHtml(view.copy.onThisPage)}</h2><div class="sk-grid">${cards}</div>` : "";
  return `${renderHero(view.page.title, renderCrumbs(view))}${tiles ? `<div class="tiles">${tiles}</div>` : ""}${sections}${SKELETON_BAND}`;
}

const SKELETON_BAND = `<section class="sk-band" aria-hidden="true">
  <div class="sk-lines"><span class="sk sk-title"></span><span class="sk"></span><span class="sk"></span><span class="sk sk-short"></span></div>
  <div class="sk sk-media"></div>
</section>`;

function renderHero(title, crumbs) {
  return `<section class="hero">
    <div class="hero-text">
      ${crumbs}
      <h1>${escapeHtml(title)}</h1>
      <div class="sk-lines" aria-hidden="true"><span class="sk"></span><span class="sk"></span><span class="sk sk-short"></span></div>
      <div class="sk-buttons" aria-hidden="true"><span class="sk sk-btn sk-btn-primary"></span><span class="sk sk-btn"></span></div>
    </div>
    <div class="sk sk-media" aria-hidden="true"></div>
  </section>`;
}

function renderCard(title) {
  const heading = title ? `<h3>${escapeHtml(title)}</h3>` : `<span class="sk sk-title" aria-hidden="true"></span>`;
  return `<article class="sk-card"><div class="sk sk-thumb" aria-hidden="true"></div>${heading}<span class="sk" aria-hidden="true"></span><span class="sk sk-short" aria-hidden="true"></span></article>`;
}

function renderCrumbs(view) {
  const items = view.crumbs.map((crumb) => {
    if (crumb.kind === "home") return `<li><a href="#/" data-home data-origin="Brotkrumen">${escapeHtml(crumb.label)}</a></li>`;
    if (crumb.kind === "page") return `<li><a href="#/p/${escapeHtml(crumb.id)}" data-page="${escapeHtml(crumb.id)}" data-origin="Brotkrumen">${escapeHtml(crumb.label)}</a></li>`;
    if (crumb.kind === "current") return `<li aria-current="page">${escapeHtml(crumb.label)}</li>`;
    return `<li>${escapeHtml(crumb.label)}</li>`;
  }).join("");
  return `<div class="crumbs" role="navigation" aria-label="${escapeHtml(view.copy.breadcrumbLabel)}"><ol>${items}</ol></div>`;
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
