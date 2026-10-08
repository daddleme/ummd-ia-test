import { content } from "./content.js";

export function searchPages(query, version, lang) {
  const needle = query.trim().toLocaleLowerCase("de");
  if (needle.length < 2) return null;
  const hubs = new Set(Object.keys(content.hubs));
  const hits = [];
  for (const id of content.pageOrder) {
    if (version === "b" && hubs.has(id)) continue;
    const copy = content.pages[id][lang];
    const haystack = [copy.title, copy.sentence, ...copy.items].join("\n").toLocaleLowerCase("de");
    const inText = haystack.includes(needle);
    const inSynonym = content.synonyms.some((synonym) => synonym.page === id && synonym.terms.some((term) => {
      const value = term.toLocaleLowerCase("de");
      return value.includes(needle) || needle.includes(value);
    }));
    if (inText || inSynonym) hits.push(id);
  }
  return hits;
}
