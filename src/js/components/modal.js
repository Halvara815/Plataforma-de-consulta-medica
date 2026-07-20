import { escapeHtml } from '../utils.js';

export function openModal({ title, bodyHtml, footerHtml = '', size = 'md', onMount, onClose }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal${size === 'lg' ? ' modal-lg' : ''}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-header">
        <h2 id="modal-title">${escapeHtml(title)}</h2>
        <button type="button" class="modal-close" aria-label="Cerrar">✕</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
      ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  function close() {
    overlay.remove();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    if (onClose) onClose();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close();
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector('.modal-close').addEventListener('click', close);
  document.addEventListener('keydown', onKeydown);

  const modalEl = overlay.querySelector('.modal');
  const focusable = modalEl.querySelector('input, select, textarea, button');
  if (focusable) focusable.focus();

  // Se pasa `close` como argumento (en vez de solo dejar que onMount la capture por closure
  // desde el valor de retorno) porque onMount se ejecuta de forma síncrona, ANTES de que la
  // asignación por destructuring en el llamador ({ close } = openModal(...)) se complete.
  // Referenciar esa constante externa aquí lanzaría "Cannot access 'close' before initialization".
  if (onMount) onMount(modalEl, close);

  return { overlay, modalEl, close };
}
