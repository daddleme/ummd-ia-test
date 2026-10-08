export function emptyLog() {
  return { entries: [] };
}

export function record(log, entry, now) {
  const previous = [...log.entries].reverse().find((item) => item.type === "task");
  const task = entry.type === "task" ? entry.taskMark : (previous ? previous.taskMark : null);
  return { entries: [...log.entries, { ...entry, at: now, task }] };
}

export function fileName(participant, day) {
  const cleaned = participant.trim().replace(/[^A-Za-z0-9_äöüÄÖÜß-]/g, "-");
  return `ummd-protokoll-${cleaned || "unbenannt"}-${day}.json`;
}

export function serialize(log) {
  const taskEntry = [...log.entries].reverse().find((item) => item.type === "task");
  return JSON.stringify({
    participant: taskEntry ? taskEntry.taskMark.participant : "",
    entries: log.entries,
  }, null, 2);
}
