export function resolveVersion(search, stored) {
  const value = new URLSearchParams(search).get("v");
  if (value === "a" || value === "b") return value;
  if (stored === "a" || stored === "b") return stored;
  return "a";
}
