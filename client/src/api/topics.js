import { apiFetch } from './client';

export function fetchTopics() {
  return apiFetch('/topics');
}

export function createTopic({ name, reviewsNeeded, subjectId }) {
  return apiFetch('/topics', { method: 'POST', body: { name, reviewsNeeded, subjectId } });
}

export function updateTopic(id, { name, reviewsNeeded, subjectId }) {
  return apiFetch(`/topics/${id}`, { method: 'PUT', body: { name, reviewsNeeded, subjectId } });
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
