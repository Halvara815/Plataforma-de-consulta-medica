function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();

  return {
    getState() {
      return state;
    },
    setState(partial) {
      state = { ...state, ...(typeof partial === 'function' ? partial(state) : partial) };
      listeners.forEach((listener) => listener(state));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

export const appState = createStore({
  currentUser: {
    id: 'MED-0001',
    nombre: 'Dr. Carlos Pérez',
    especialidad: 'Médico General',
    cedula: '12345678',
    estado: 'En línea'
  },
  route: null,
  sidebarCollapsed: false,
  sidebarExpandedMobile: false,
  dataReady: false
});

export function toggleSidebarCollapsed() {
  appState.setState((s) => ({ sidebarCollapsed: !s.sidebarCollapsed }));
}

export function toggleSidebarMobile(force) {
  appState.setState((s) => ({
    sidebarExpandedMobile: typeof force === 'boolean' ? force : !s.sidebarExpandedMobile
  }));
}
