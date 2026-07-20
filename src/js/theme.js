import { getLocal, setLocal } from './storage.js';

const THEME_KEY = 'theme';

export function getTheme() {
  return getLocal(THEME_KEY, 'system');
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export function setTheme(theme) {
  setLocal(THEME_KEY, theme);
  applyTheme(theme);
}

export function toggleTheme() {
  const current = getTheme();
  const effectiveDark =
    current === 'dark' ||
    (current === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const next = effectiveDark ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export function initTheme() {
  applyTheme(getTheme());
}
