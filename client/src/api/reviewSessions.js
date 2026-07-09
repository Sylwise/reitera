import { apiFetch } from './client';

export function addReviewSession(topicId, { dificultad, score }) {
  return apiFetch(`/topics/${topicId}/review-sessions`, {
    method: 'POST',
    body: { difficulty: dificultad.toUpperCase(), score: score || null },
  });
}
