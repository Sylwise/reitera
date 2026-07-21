import { apiFetch } from './client';

export function fetchTopics() {
  return apiFetch('/topics');
}

export function createTopic({ name, subjectId }) {
  return apiFetch('/topics', { method: 'POST', body: { name, subjectId } });
}

export function updateTopic(id, { name, subjectId }) {
  return apiFetch(`/topics/${id}`, { method: 'PUT', body: { name, subjectId } });
}

export function deleteTopic(id) {
  return apiFetch(`/topics/${id}`, { method: 'DELETE' });
}

export function resetTopic(id) {
  return apiFetch(`/topics/${id}/reset`, { method: 'POST' });
}

export function fetchTopic(id) {
  return apiFetch(`/topics/${id}`);
}
