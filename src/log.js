import { buildPaths } from "./paths.js";

export function emptyLog() {
  return { entries: [] };
}

export function record(log, entry, now) {
  const previous = [...log.entries].reverse().find((item) => item.type === "task");
  const task = entry.type === "task" ? entry.taskMark : (previous ? previous.taskMark : null);
  return { entries: [...log.entries, { ...entry, at: now, task }] };
}

export function fileStamp(date) {
  const two = (value) => String(value).padStart(2, "0");
  const day = `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`;
  return `${day}_${two(date.getHours())}-${two(date.getMinutes())}-${two(date.getSeconds())}`;
}

export function fileName(participant, stamp) {
  const cleaned = participant.trim().replace(/[^A-Za-z0-9_äöüÄÖÜß-]/g, "-");
  return `ummd-protokoll-${cleaned || "unbenannt"}-${stamp}.json`;
}

export function serialize(log) {
  const taskEntry = [...log.entries].reverse().find((item) => item.type === "task");
  return JSON.stringify({
    participant: taskEntry ? taskEntry.taskMark.participant : "",
    paths: buildPaths(log.entries),
    entries: log.entries,
  }, null, 2);
}
