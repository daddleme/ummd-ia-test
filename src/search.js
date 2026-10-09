import { content } from "./content.js";
import { hiddenInVersion, pageCopy } from "./pages.js";

export function searchPages(query, version, lang) {
  const needle = query.trim().toLocaleLowerCase("de");
  if (needle.length < 2) return null;
  const hits = [];
  for (const id of content.pageOrder) {
    if (hiddenInVersion(id, version)) continue;
    const copy = pageCopy(id, version, lang);
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
