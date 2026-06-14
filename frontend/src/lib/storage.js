// storage.js — local-first persistence for saved agents + canvas autosave.
// localStorage is the source of truth; the backend (services/api.js) is a best-effort mirror.

const LIBRARY_KEY = 'vs.library';
const AUTOSAVE_KEY = 'vs.autosave';

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore */
  }
};

export const newId = () =>
  `agent-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

// ---- Library (named saves) ----

export const loadLibrary = () => read(LIBRARY_KEY, []);

export const saveToLibrary = (record) => {
  const lib = loadLibrary();
  const idx = lib.findIndex((r) => r.id === record.id);
  if (idx >= 0) lib[idx] = record;
  else lib.unshift(record);
  write(LIBRARY_KEY, lib);
  return lib;
};

export const removeFromLibrary = (id) => {
  const lib = loadLibrary().filter((r) => r.id !== id);
  write(LIBRARY_KEY, lib);
  return lib;
};

// Merge backend records into local by last-write-wins on updatedAt.
export const mergeLibrary = (remote = []) => {
  const byId = {};
  for (const r of loadLibrary()) byId[r.id] = r;
  for (const r of remote) {
    if (!byId[r.id] || (r.updatedAt || 0) > (byId[r.id].updatedAt || 0)) byId[r.id] = r;
  }
  const merged = Object.values(byId).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  write(LIBRARY_KEY, merged);
  return merged;
};

// ---- Autosave (live canvas) ----

export const loadAutosave = () => read(AUTOSAVE_KEY, null);
export const writeAutosave = (graph) => write(AUTOSAVE_KEY, graph);

// ---- JSON export / import ----

export const exportRecord = (record) => {
  const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(record.name || 'agent').replace(/\s+/g, '-').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importRecord = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch (e) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsText(file);
  });
