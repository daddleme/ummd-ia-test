const seconds = (ms) => Math.round(ms / 100) / 10;
const two = (value) => String(value).padStart(2, "0");

function clock(iso) {
  const date = new Date(iso);
  return `${two(date.getHours())}:${two(date.getMinutes())}:${two(date.getSeconds())}`;
}

function mouse(hover) {
  return {
    element: hover.element,
    bereich: hover.bereich,
    sekunden: hover.sekunden,
    ...(hover.geklickt ? { geklickt: true } : {}),
  };
}

export function buildPaths(entries) {
  const sorted = [...entries].sort((a, b) => a.at.localeCompare(b.at));
  const paths = [];
  let current = null;
  let hovers = [];

  function close() {
    if (current && current.steps.length > 1) {
      paths.push({
        nr: paths.length + 1,
        version: current.version,
        task: current.task,
        ziel: current.steps.at(-1).seite,
        dauerSekunden: seconds(Date.parse(current.lastAt) - Date.parse(current.startAt)),
        klicks: current.steps.length - 1,
        schritte: current.steps,
      });
    }
    current = null;
    hovers = [];
  }

  function open(entry, seite) {
    close();
    current = {
      version: entry.version,
      task: entry.task?.task || null,
      startAt: entry.at,
      lastAt: entry.at,
      steps: [{ seite, zeit: clock(entry.at) }],
    };
  }

  function step(entry, fields) {
    current.steps.push({
      ...fields,
      zeit: clock(entry.at),
      sekundenSeitVorher: seconds(Date.parse(entry.at) - Date.parse(current.lastAt)),
      ...(hovers.length ? { mausVorher: hovers } : {}),
    });
    hovers = [];
    current.lastAt = entry.at;
    if (entry.task?.task) current.task = entry.task.task;
  }

  for (const entry of sorted) {
    if (entry.type === "page" && entry.page.path === "#/") { open(entry, "Startseite"); continue; }
    if (entry.type === "page" && entry.page.origin === "Teststart") { open(entry, entry.page.title); continue; }
    if (entry.type === "version") { open(entry, `Wechsel auf Version ${entry.version.toUpperCase()}`); continue; }
    if (entry.type === "start" || entry.type === "end") { close(); continue; }
    if (!current) continue;
    if (entry.type === "hover") hovers.push(mouse(entry.hover));
    else if (entry.type === "page") step(entry, { seite: entry.page.title, pfad: entry.page.path, herkunft: entry.page.origin });
    else if (entry.type === "search") step(entry, { seite: "Suchergebnisse", suche: entry.search.query, treffer: entry.search.count });
    else if (entry.type === "sprechstunde") step(entry, { seite: current.steps.at(-1).seite, sprechstundenSuche: entry.search.query });
  }
  close();
  return paths;
}
