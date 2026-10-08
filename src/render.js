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
