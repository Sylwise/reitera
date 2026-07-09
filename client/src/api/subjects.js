import { apiFetch } from './client';

export function fetchSubjects() {
  return apiFetch('/subjects');
}

export function createSubject({ name, totalTopics, color }) {
  return apiFetch('/subjects', { method: 'POST', body: { name, totalTopics, color } });
}

export function updateSubject(id, { name, totalTopics, color }) {
  return apiFetch(`/subjects/${id}`, { method: 'PUT', body: { name, totalTopics, color } });
}

export function deleteSubject(id) {
  return apiFetch(`/subjects/${id}`, { method: 'DELETE' });
}
