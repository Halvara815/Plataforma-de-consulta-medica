import { debounce, escapeHtml } from '../utils.js';
import { icon } from '../icons.js';

/**
 * Tabla genérica filtrable/ordenable/paginada.
 * columns: [{ key, label, sortable, render(row) }]
 */
export function createTable({
  columns,
  rows,
  searchableKeys = [],
  pageSize = 8,
  onRowClick = null,
  rowKey = 'id',
  emptyMessage = 'No hay registros para mostrar.',
  searchPlaceholder = 'Buscar…',
  toolbarExtraHtml = ''
}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'table-wrapper';

  let state = {
    rows,
    search: '',
    sortKey: null,
    sortDir: 'asc',
    page: 1
  };

  function getFiltered() {
    let out = state.rows;
    if (state.search && searchableKeys.length) {
      const term = state.search.toLowerCase();
      out = out.filter((row) =>
        searchableKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(term))
      );
    }
    if (state.sortKey) {
      out = [...out].sort((a, b) => {
        const av = a[state.sortKey];
        const bv = b[state.sortKey];
        if (av === bv) return 0;
        const result = av > bv ? 1 : -1;
        return state.sortDir === 'asc' ? result : -result;
      });
    }
    return out;
  }

  function render() {
    const filtered = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (state.page > totalPages) state.page = totalPages;
    const start = (state.page - 1) * pageSize;
    const pageRows = filtered.slice(start, start + pageSize);

    const headHtml = columns
      .map((col) => {
        const sortableClass = col.sortable ? ' sortable' : '';
        const arrow = state.sortKey === col.key ? (state.sortDir === 'asc' ? ' ▲' : ' ▼') : '';
        return `<th class="${sortableClass.trim()}" data-key="${col.key}" data-sortable="${!!col.sortable}">${escapeHtml(col.label)}${arrow}</th>`;
      })
      .join('');

    const bodyHtml = pageRows.length
      ? pageRows
          .map((row) => {
            const cells = columns
              .map((col) => `<td>${col.render ? col.render(row) : escapeHtml(row[col.key] ?? '')}</td>`)
              .join('');
            return `<tr class="${onRowClick ? 'is-clickable' : ''}" data-row-id="${escapeHtml(row[rowKey])}">${cells}</tr>`;
          })
          .join('')
      : '';

    wrapper.innerHTML = `
      <div class="table-toolbar">
        ${
          searchableKeys.length
            ? `<div class="table-search">
                ${icon('search', { size: 16 })}
                <input type="search" placeholder="${escapeHtml(searchPlaceholder)}" value="${escapeHtml(state.search)}" aria-label="${escapeHtml(searchPlaceholder)}" />
              </div>`
            : '<div></div>'
        }
        <div class="view-actions">${toolbarExtraHtml}</div>
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr>${headHtml}</tr></thead>
          <tbody>${bodyHtml}</tbody>
        </table>
        ${!pageRows.length ? `<div class="table-empty">${escapeHtml(emptyMessage)}</div>` : ''}
      </div>
      <div class="table-pagination">
        <span>${filtered.length} registro(s) · página ${state.page} de ${totalPages}</span>
        <div class="view-actions">
          <button type="button" class="btn btn-ghost btn-sm" data-page="prev" ${state.page <= 1 ? 'disabled' : ''}>‹ Anterior</button>
          <button type="button" class="btn btn-ghost btn-sm" data-page="next" ${state.page >= totalPages ? 'disabled' : ''}>Siguiente ›</button>
        </div>
      </div>
    `;

    wireEvents();
  }

  const onSearchInput = debounce((value) => {
    state.search = value;
    state.page = 1;
    render();
  }, 200);

  function wireEvents() {
    const searchInput = wrapper.querySelector('.table-search input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => onSearchInput(e.target.value));
    }

    wrapper.querySelectorAll('th[data-sortable="true"]').forEach((th) => {
      th.addEventListener('click', () => {
        const key = th.dataset.key;
        if (state.sortKey === key) {
          state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortKey = key;
          state.sortDir = 'asc';
        }
        render();
      });
    });

    wrapper.querySelectorAll('[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.page += btn.dataset.page === 'next' ? 1 : -1;
        render();
      });
    });

    if (onRowClick) {
      wrapper.querySelectorAll('tbody tr').forEach((tr) => {
        tr.addEventListener('click', () => {
          const row = state.rows.find((r) => String(r[rowKey]) === tr.dataset.rowId);
          if (row) onRowClick(row);
        });
      });
    }
  }

  render();

  return {
    el: wrapper,
    setRows(newRows) {
      state.rows = newRows;
      state.page = 1;
      render();
    }
  };
}
