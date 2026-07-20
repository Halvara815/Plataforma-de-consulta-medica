import { idbGetAll, idbPut, idbClearAll, isIndexedDbAvailable } from '../storage.js';
import { generateId } from '../utils.js';

// Vite soporta imports nativos de JSON como módulos ES: esto es lo que en producción
// se reemplaza por llamadas HTTP a un backend real (ver docs/PRODUCTION_ROADMAP.md).
import pacientesJson from '../../data/pacientes.json';
import citasJson from '../../data/citas.json';
import medicosJson from '../../data/medicos.json';
import consultasJson from '../../data/consultas.json';
import recetasJson from '../../data/recetas.json';
import documentosJson from '../../data/documentos.json';
import estudiosJson from '../../data/estudios.json';
import catalogosJson from '../../data/catalogos.json';

const BASE_DATA = {
  pacientes: pacientesJson,
  citas: citasJson,
  medicos: medicosJson,
  consultas: consultasJson,
  recetas: recetasJson,
  documentos: documentosJson,
  estudios: estudiosJson,
  catalogos: catalogosJson
};

// Colecciones que aceptan altas/ediciones en esta demo y se sincronizan a IndexedDB
// para que sobrevivan a un reload sin backend (ver storage.js STORES).
const PERSISTED_COLLECTIONS = ['pacientes', 'citas', 'consultas', 'recetas', 'documentos', 'estudios'];

const ID_PREFIX = {
  pacientes: 'PAC',
  citas: 'CITA',
  consultas: 'CONS',
  recetas: 'REC',
  documentos: 'DOC',
  estudios: 'EST'
};

let baseCache = null; // datos originales tal como vienen de los JSON, para poder "resetear la demo"
let cache = null; // datos actuales en memoria (base + overrides de IndexedDB de esta sesión)
let readyPromise = null;

function mergeWithOverrides(baseRecords, overrideRecords) {
  const map = new Map(baseRecords.map((record) => [record.id, record]));
  overrideRecords.forEach((record) => {
    if (record._deleted) {
      map.delete(record.id);
    } else {
      map.set(record.id, { ...map.get(record.id), ...record });
    }
  });
  return Array.from(map.values());
}

async function loadAll() {
  baseCache = { ...BASE_DATA };
  cache = { ...baseCache };
  for (const collection of PERSISTED_COLLECTIONS) {
    cache[collection] = [...baseCache[collection]];
    if (isIndexedDbAvailable()) {
      const overrides = await idbGetAll(collection);
      if (overrides && overrides.length) {
        cache[collection] = mergeWithOverrides(baseCache[collection], overrides);
      }
    }
  }

  return cache;
}

export function initDataService() {
  if (!readyPromise) readyPromise = loadAll();
  return readyPromise;
}

function assertReady() {
  if (!cache) {
    throw new Error('dataService no ha sido inicializado. Llama initDataService() antes de usarlo.');
  }
}

export function getAll(collection) {
  assertReady();
  return cache[collection] || [];
}

export function getCatalogos() {
  assertReady();
  return cache.catalogos;
}

export function getById(collection, id) {
  assertReady();
  return (cache[collection] || []).find((record) => String(record.id) === String(id)) || null;
}

export function query(collection, predicate) {
  assertReady();
  return (cache[collection] || []).filter(predicate);
}

export async function create(collection, data) {
  assertReady();
  const record = { id: data.id || generateId(ID_PREFIX[collection] || 'REG'), ...data };
  cache[collection] = [...(cache[collection] || []), record];
  if (PERSISTED_COLLECTIONS.includes(collection)) {
    await idbPut(collection, record);
  }
  return record;
}

export async function update(collection, id, patch) {
  assertReady();
  const list = cache[collection] || [];
  const index = list.findIndex((r) => String(r.id) === String(id));
  if (index === -1) return null;
  const merged = { ...list[index], ...patch, id: list[index].id };
  list[index] = merged;
  cache[collection] = [...list];
  if (PERSISTED_COLLECTIONS.includes(collection)) {
    await idbPut(collection, merged);
  }
  return merged;
}

export async function remove(collection, id) {
  assertReady();
  cache[collection] = (cache[collection] || []).filter((r) => String(r.id) !== String(id));
  if (PERSISTED_COLLECTIONS.includes(collection)) {
    await idbPut(collection, { id, _deleted: true });
  }
  return true;
}

export async function resetDemoData() {
  await idbClearAll();
  cache = null;
  readyPromise = null;
  return initDataService();
}

export function isPersistedCollection(collection) {
  return PERSISTED_COLLECTIONS.includes(collection);
}
