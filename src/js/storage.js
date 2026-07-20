const LOCAL_PREFIX = 'cp_ui_';
const DB_NAME = 'consulta_practica_demo';
const DB_VERSION = 1;
const STORES = ['citas', 'consultas', 'recetas', 'documentos', 'estudios', 'pacientes'];

export function getLocal(key, fallback = null) {
  try {
    const raw = localStorage.getItem(LOCAL_PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setLocal(key, value) {
  try {
    localStorage.setItem(LOCAL_PREFIX + key, JSON.stringify(value));
  } catch {
    /* localStorage no disponible o cuota excedida: se ignora en esta demo */
  }
}

let dbPromise = null;

function isIndexedDbAvailable() {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

function openDb() {
  if (!isIndexedDbAvailable()) return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      STORES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });

  return dbPromise;
}

export async function idbGetAll(storeName) {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

export async function idbPut(storeName, record) {
  const db = await openDb();
  if (!db) return false;
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(record);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
  });
}

export async function idbBulkPut(storeName, records) {
  const db = await openDb();
  if (!db || !records?.length) return false;
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    records.forEach((record) => store.put(record));
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
  });
}

export async function idbClearAll() {
  const db = await openDb();
  if (!db) return false;
  return Promise.all(
    STORES.map(
      (storeName) =>
        new Promise((resolve) => {
          const tx = db.transaction(storeName, 'readwrite');
          tx.objectStore(storeName).clear();
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        })
    )
  );
}

export async function idbExportAll() {
  const out = {};
  for (const storeName of STORES) {
    out[storeName] = (await idbGetAll(storeName)) || [];
  }
  return out;
}

export { STORES, isIndexedDbAvailable };
