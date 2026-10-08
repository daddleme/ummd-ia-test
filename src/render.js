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
  return `<div id="testbar">
    <span>Prototyp</span>
    <div class="segment" role="group" aria-label="Version">
      <button type="button" data-version="a" aria-pressed="${view.version === "a"}">Version A</button>
      <button type="button" data-version="b" aria-pressed="${view.version === "b"}">Version B</button>
    </div>
    <button type="button" data-end>Test beenden</button>
  </div>
  <header>
    <div class="topline">
      <a class="logo" href="#/" data-home><strong>UMMD</strong><small>Universitätsmedizin Magdeburg</small></a>
      <div class="tools">
        ${pageLink("notfall", view.level1[0].label, "is-emergency")}
        <form data-search-form>
          <input data-search aria-label="${escapeHtml(view.copy.searchLabel)}" placeholder="${escapeHtml(view.copy.searchLabel)}" value="${escapeHtml(view.routeName === "search" ? view.query : "")}">
          <button type="submit">${escapeHtml(view.copy.searchButton)}</button>
        </form>
        ${pageLink("kontakt", view.level1[1].label, "quiet")}
        <label class="lang">${escapeHtml(langLabel)}
          <select data-lang-select aria-label="${escapeHtml(langLabel)}">
            <option value="de" ${view.lang === "de" ? "selected" : ""}>Deutsch</option>
            <option value="en" ${view.lang === "en" ? "selected" : ""}>English</option>
          </select>
        </label>
      </div>
    </div>
    <div class="navwrap">
      <nav>
        ${view.areas.map((area) => `<button type="button" data-area="${area.id}" aria-expanded="${view.openArea === area.id}"${view.currentArea === area.id ? ' aria-current="true"' : ""}>${escapeHtml(area.label)}</button>`).join("")}
      </nav>
      ${menus}
    </div>
  </header>
  <main id="page">${main}</main>
  ${moderator}`;
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
  if (view.routeName === "home") return `<h1>${escapeHtml(view.home.title)}</h1><p class="lead">${escapeHtml(view.home.sentence)}</p>`;
  const tiles = view.tiles.map((tile) => `<a class="tile" href="#/p/${escapeHtml(tile.id)}" data-page="${escapeHtml(tile.id)}" data-origin="Kachel"><strong>${escapeHtml(tile.label)}</strong><span>${escapeHtml(tile.sentence)}</span></a>`).join("");
  const items = view.page.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const eyebrow = view.areaName ? `<p class="eyebrow">${escapeHtml(view.areaName)}</p>` : "";
  return `${eyebrow}<h1>${escapeHtml(view.page.title)}</h1><p class="lead">${escapeHtml(view.page.sentence)}</p>${tiles ? `<div class="tiles">${tiles}</div>` : ""}<h2>${escapeHtml(view.copy.onThisPage)}</h2><ul class="chips">${items}</ul>`;
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
