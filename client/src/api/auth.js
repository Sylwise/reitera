import { apiFetch, setToken, clearToken } from './client';

export async function register({ name, email, password }) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: { name, email, password },
    auth: false,
  });
}

export async function login({ email, password }) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
  setToken(data.token);
  return data;
}

export function deleteAccount() {
  return apiFetch('/auth/me', { method: 'DELETE' });
}

export function logout() {
  clearToken();
}
