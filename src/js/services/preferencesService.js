import {
  getPreferences,
  getSignatures,
  resetHerramientasPreferences,
  updatePreferences as requestPreferencesUpdate,
} from './dataService.js';

const DEFAULT_PREFERENCES = Object.freeze({
  tema: 'system',
  sonidoTemporizador: true,
  notas: [],
  recordatorios: [],
  plantillas: [],
  favoritos: ['nuevo-paciente', 'agenda', 'reportes'],
});

let preferences = null;
let loadPromise = null;

function cloneDefaults() {
  return {
    ...DEFAULT_PREFERENCES,
    notas: [],
    recordatorios: [],
    plantillas: [],
    favoritos: [...DEFAULT_PREFERENCES.favoritos],
  };
}

function normalize(value) {
  return {
    ...cloneDefaults(),
    ...(value || {}),
    notas: Array.isArray(value?.notas) ? value.notas : [],
    recordatorios: Array.isArray(value?.recordatorios) ? value.recordatorios : [],
    plantillas: Array.isArray(value?.plantillas) ? value.plantillas : [],
    favoritos: Array.isArray(value?.favoritos) ? value.favoritos : [...DEFAULT_PREFERENCES.favoritos],
  };
}

export async function loadPreferences({ force = false } = {}) {
  if (force) {
    preferences = null;
    loadPromise = null;
  }
  if (preferences) return preferences;
  if (!loadPromise) {
    loadPromise = getPreferences()
      .then((response) => {
        preferences = normalize(response);
        return preferences;
      })
      .finally(() => {
        loadPromise = null;
      });
  }
  return loadPromise;
}

export function getPreferencesSnapshot() {
  return preferences || cloneDefaults();
}

export async function updatePreferences(patch) {
  const response = await requestPreferencesUpdate(patch);
  preferences = normalize(response);
  return preferences;
}

export async function resetHerramientas() {
  const response = await resetHerramientasPreferences();
  preferences = normalize(response);
  return preferences;
}

export async function loadSignatures() {
  return getSignatures();
}

export function clearPreferencesCache() {
  preferences = null;
  loadPromise = null;
}
