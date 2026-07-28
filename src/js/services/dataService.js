const API_URL = 'http://localhost:3000/api/v1';

let readyPromise = null;

// Helper to make authenticated requests
async function fetchApi(endpoint, options = {}) {
  // Try to get token from wherever it is stored in the future (e.g. state or localStorage)
  // Currently the app uses a global state, but for the fetch we can check localStorage
  const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error en la petición: ${response.statusText}`);
  }

  // If it's a DELETE or empty response, don't try to parse JSON
  if (response.status === 204) {
    return true;
  }

  return response.json();
}

export async function initDataService() {
  if (!readyPromise) {
    // Simulamos que el servicio está listo (podría hacer un ping al backend o cargar catálogos base)
    readyPromise = Promise.resolve(true);
  }
  return readyPromise;
}

export async function getAll(collection) {
  return fetchApi(collection);
}

export async function getCatalogos() {
  return fetchApi('catalogos');
}

export async function getById(collection, id) {
  return fetchApi(`${collection}/${id}`);
}

// Para mantener compatibilidad temporal con componentes que pasaban un callback (predicate),
// traemos todos y filtramos en memoria. En producción, esto debería pasar a ser query params.
export async function query(collection, predicate) {
  const allRecords = await fetchApi(collection);
  if (typeof predicate === 'function') {
    return allRecords.filter(predicate);
  }
  // Si predicate fuera un string (querystring), podríamos enviarlo directo: fetchApi(`${collection}?${predicate}`)
  return allRecords;
}

export async function create(collection, data) {
  return fetchApi(collection, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function update(collection, id, patch) {
  return fetchApi(`${collection}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function remove(collection, id) {
  return fetchApi(`${collection}/${id}`, {
    method: 'DELETE',
  });
}

export async function resetDemoData() {
  // El reset en el backend podría llamar a un endpoint especial de seed, 
  // pero por ahora solo limpiamos tokens
  localStorage.removeItem('jwt_token');
  sessionStorage.removeItem('jwt_token');
  return true;
}

export function isPersistedCollection(collection) {
  // Ahora todas las colecciones se persisten en el backend
  return true;
}

