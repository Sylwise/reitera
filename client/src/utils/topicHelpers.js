function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function daysUntil(nextReviewDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const review = parseLocalDate(nextReviewDate);
  return Math.round((review - today) / 86400000);
}

export function getTopicStatus(topic) {
  if (topic.nextReviewDate === null || topic.reviewCount >= topic.reviewsNeeded) return 'mastered';
  const diff = daysUntil(topic.nextReviewDate);
  if (diff < 0)  return 'overdue';
  if (diff === 0) return 'today';
  if (diff <= 3) return 'soon';
  return 'future';
}

export function formatDaysLabel(topic) {
  const s = getTopicStatus(topic);
  if (s === 'mastered') return 'Afianzado';
  if (s === 'today')    return 'HOY';
  const days = Math.abs(daysUntil(topic.nextReviewDate));
  if (s === 'overdue') return `+${days}d retraso`;
  return `En ${days}d`;
}

export function getAsigColor(subjectId, subjects) {
  return subjects.find(s => s.id === subjectId)?.color ?? '#888';
}
