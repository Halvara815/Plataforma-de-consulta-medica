import { getPreferencesSnapshot, loadPreferences, updatePreferences } from './services/preferencesService.js';

let currentTheme = 'system';

export function getTheme() {
  return currentTheme;
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export async function setTheme(theme) {
  if (!['light', 'dark', 'system'].includes(theme)) return currentTheme;
  const previousTheme = currentTheme;
  currentTheme = theme;
  applyTheme(theme);
  try {
    await updatePreferences({ tema: theme });
    return currentTheme;
  } catch (error) {
    currentTheme = previousTheme;
    applyTheme(previousTheme);
    throw error;
  }
}

export async function toggleTheme() {
  const current = getTheme();
  const effectiveDark =
    current === 'dark' ||
    (current === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const next = effectiveDark ? 'light' : 'dark';
  return setTheme(next);
}

export function initTheme() {
  currentTheme = getPreferencesSnapshot().tema;
  applyTheme(currentTheme);
}

export async function loadThemePreference() {
  const preferences = await loadPreferences();
  currentTheme = preferences.tema;
  applyTheme(currentTheme);
  return currentTheme;
}
