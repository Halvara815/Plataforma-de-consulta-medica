const configuredApiUrl = import.meta.env?.VITE_API_URL;
const isViteServer = ['5173', '4173'].includes(window.location.port);
const localApiUrl = `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;
// Vite usa su proxy; Live Server no lo tiene y por eso llega a NestJS directamente.
const API_URL = (configuredApiUrl || (isViteServer ? '/api/v1' : localApiUrl)).replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = 10_000;

let readyPromise = null;
let accessToken = null;
let refreshPromise = null;

export class ApiError extends Error {
  constructor(message, { status = null, code = 'API_REQUEST_FAILED' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function responseMessage(payload) {
  const message = payload?.message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message)) return message.join(', ');
  if (message && typeof message.message === 'string') return message.message;
  return null;
}

export function userFacingApiError(error) {
  switch (error?.code) {
    case 'API_UNAVAILABLE':
      return 'No se pudo conectar con la API local. Inicia el backend y vuelve a intentarlo.';
    case 'API_TIMEOUT':
      return 'La API tardó demasiado en responder. Verifica que PostgreSQL y el backend estén activos.';
    case 'AUTH_REQUIRED':
      return 'Inicia sesión para acceder a la información clínica.';
    case 'LOGIN_FAILED':
      return 'Correo o contraseña inválidos.';
    case 'ACCESS_DENIED':
      return 'Tu cuenta no tiene permiso para abrir esta sección.';
    case 'TOO_MANY_REQUESTS':
      return 'Se alcanzó el límite de intentos. Espera unos minutos antes de volver a intentarlo.';
    case 'SCHEDULE_CONFLICT':
      return 'El médico o consultorio ya tiene una cita en ese horario.';
    case 'REGISTRATION_CONFLICT':
      return error.message || 'Ya existe una cuenta o cédula con esos datos.';
    case 'API_REQUEST_FAILED':
      return error.message || 'No se pudo procesar la solicitud.';
    default:
      return 'No se pudo cargar la información solicitada. Intenta de nuevo.';
  }
}

async function request(endpoint, options = {}, { retryOnUnauthorized = true } = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 401 && retryOnUnauthorized && !endpoint.startsWith('auth/')) {
        try {
          await restoreSession();
          return request(endpoint, options, { retryOnUnauthorized: false });
        } catch {
          clearAuthSession();
        }
      }

      const errorData = await response.json().catch(() => null);
      const code = response.status === 401
        ? 'AUTH_REQUIRED'
        : response.status === 403
          ? 'ACCESS_DENIED'
          : response.status === 429
            ? 'TOO_MANY_REQUESTS'
            : response.status === 409
              ? 'SCHEDULE_CONFLICT'
              : 'API_REQUEST_FAILED';
      throw new ApiError(
        responseMessage(errorData) || `La API respondió con estado ${response.status}.`,
        { status: response.status, code },
      );
    }

    if (response.status === 204) return true;
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const code = controller.signal.aborted ? 'API_TIMEOUT' : 'API_UNAVAILABLE';
    throw new ApiError(userFacingApiError({ code }), { code });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function initDataService() {
  if (!readyPromise) {
    readyPromise = request('health', {}, { retryOnUnauthorized: false })
      .then(() => true)
      .catch((error) => {
        readyPromise = null;
        throw error;
      });
  }
  return readyPromise;
}

export async function login(email, password) {
  try {
    const result = await request('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, { retryOnUnauthorized: false });
    accessToken = result.accessToken;
    return result.user;
  } catch (error) {
    if (error?.code === 'AUTH_REQUIRED') {
      throw new ApiError('Credenciales inválidas.', { status: 401, code: 'LOGIN_FAILED' });
    }
    throw error;
  }
}

export async function registerDoctor(data) {
  try {
    return await request('auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, { retryOnUnauthorized: false });
  } catch (error) {
    if (error?.status === 409) {
      throw new ApiError(error.message, { status: error.status, code: 'REGISTRATION_CONFLICT' });
    }
    throw error;
  }
}

export async function restoreSession() {
  if (!refreshPromise) {
    refreshPromise = request('auth/refresh', { method: 'POST' }, { retryOnUnauthorized: false })
      .then((result) => {
        accessToken = result.accessToken;
        return result.user;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function logout() {
  try {
    await request('auth/logout', { method: 'POST' }, { retryOnUnauthorized: false });
  } finally {
    clearAuthSession();
  }
}

export function clearAuthSession() {
  accessToken = null;
}

export function isAuthenticated() {
  return Boolean(accessToken);
}

function withQuery(collection, params = {}) {
  const search = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
  return `${collection}${search.size ? `?${search.toString()}` : ''}`;
}

export async function getAll(collection, params = {}) {
  const result = await request(withQuery(collection, params));
  return Array.isArray(result) ? result : Array.isArray(result?.items) ? result.items : result;
}

export async function getPage(collection, params = {}) {
  const result = await request(withQuery(collection, params));
  if (Array.isArray(result)) {
    return { items: result, pagination: { page: 1, limit: result.length, total: result.length, totalPages: 1 } };
  }
  return result;
}

export async function getCatalogos() {
  return request('catalogos');
}

export async function getById(collection, id) {
  return request(`${collection}/${id}`);
}

export async function query(collection, predicate, params = {}) {
  const allRecords = await getAll(collection, params);
  return typeof predicate === 'function' ? allRecords.filter(predicate) : allRecords;
}

export async function getDashboardMetrics(params = {}) {
  return request(withQuery('indicadores/dashboard', params));
}

export async function getReportMetrics() {
  return request('indicadores/reportes');
}

export async function create(collection, data) {
  return request(collection, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function update(collection, id, patch) {
  return request(`${collection}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function remove(collection, id) {
  return request(`${collection}/${id}`, { method: 'DELETE' });
}

export async function resetDemoData() {
  await logout();
  return true;
}

export function isPersistedCollection() {
  return true;
}
