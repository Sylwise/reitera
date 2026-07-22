const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
const TOKEN_KEY = 'repaso_token';
const USER_KEY = 'repaso_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

let unauthorizedHandler = null;

// App registra aquí su logout para que un 401 en cualquier petición
// devuelva al login en vez de dejar la UI con datos vacíos.
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function extractMessage(data, status) {
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') return Object.values(data).join(', ');
  return `Error ${status}`;
}

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    if (res.status === 401 && token) {
      clearToken();
      clearUser();
      if (unauthorizedHandler) unauthorizedHandler();
    }
    throw new ApiError(extractMessage(data, res.status), res.status, data);
  }

  return data;
}
