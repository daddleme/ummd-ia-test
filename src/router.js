export function parseRoute(hash) {
  const value = hash.replace(/^#/, "");
  if (value === "" || value === "/") return { name: "home" };
  if (value === "/suche") return { name: "search" };
  if (value.startsWith("/p/")) return { name: "page", id: decodeURIComponent(value.slice(3)) };
  return { name: "page", id: decodeURIComponent(value.replace(/^\//, "")) };
}

export function buildHash(route) {
  if (route.name === "search") return "#/suche";
  if (route.name === "page") return `#/p/${encodeURIComponent(route.id)}`;
  return "#/";
}

export function parseQuery(search) {
  const params = new URLSearchParams(search);
  return { v: params.get("v"), q: params.get("q") ?? "" };
}

export function buildQuery({ v, q }) {
  const params = new URLSearchParams();
  params.set("v", v);
  if (q) params.set("q", q);
  return `?${params.toString()}`;
}
