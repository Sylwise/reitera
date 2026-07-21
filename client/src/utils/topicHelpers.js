function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const EXAM_MARGIN_MIN_DAYS = 1;
const EXAM_MARGIN_RATIO    = 0.15;

// Adelanta (nunca retrasa) el nextReviewDate de los temas que caerían después del
// margen de seguridad del próximo examen de su asignatura, repartiéndolos de forma
// uniforme en el hueco libre en vez de amontonarlos justo antes del examen. No se
// persiste — es puro derivado de (topics, exams, hoy), así que se autocorrige solo
// si el examen cambia o se borra.
export function applyExamCaps(topics, exams) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextExamBySubject = new Map();
  for (const exam of exams) {
    const examDay = new Date(exam.date);
    examDay.setHours(0, 0, 0, 0);
    if (examDay < today) continue;
    const current = nextExamBySubject.get(exam.subjectId);
    if (!current || examDay < current) nextExamBySubject.set(exam.subjectId, examDay);
  }
  if (nextExamBySubject.size === 0) return topics;

  const bySubject = new Map();
  for (const topic of topics) {
    if (!bySubject.has(topic.subjectId)) bySubject.set(topic.subjectId, []);
    bySubject.get(topic.subjectId).push(topic);
  }

  const overrides = new Map();

  for (const [subjectId, examDay] of nextExamBySubject) {
    const subjTopics = bySubject.get(subjectId);
    if (!subjTopics) continue;

    const daysToExam = Math.round((examDay - today) / 86400000);
    const margin      = Math.max(EXAM_MARGIN_MIN_DAYS, Math.round(daysToExam * EXAM_MARGIN_RATIO));
    const deadline     = addDays(examDay, -margin);
    if (deadline < today) continue; // sin margen que repartir, se deja tal cual

    const windowDays = Math.round((deadline - today) / 86400000);

    const needsCompression = subjTopics
      .filter(t => t.nextReviewDate !== null && t.reviewCount < t.reviewsNeeded)
      .filter(t => parseLocalDate(t.nextReviewDate) > deadline)
      .sort((a, b) => parseLocalDate(a.nextReviewDate) - parseLocalDate(b.nextReviewDate));

    const n = needsCompression.length;
    needsCompression.forEach((t, i) => {
      const slot = Math.round((i + 1) * windowDays / n);
      overrides.set(t.id, toDateStr(addDays(today, slot)));
    });
  }

  if (overrides.size === 0) return topics;
  return topics.map(t => overrides.has(t.id) ? { ...t, nextReviewDate: overrides.get(t.id) } : t);
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

const STATUS_RANK = { overdue: 0, today: 1, soon: 2, future: 3, mastered: 4 };

// Lo que arde, arriba: atrasados (el más atrasado primero), hoy, y el resto por fecha.
export function compareByUrgency(a, b) {
  const rankDiff = STATUS_RANK[getTopicStatus(a)] - STATUS_RANK[getTopicStatus(b)];
  if (rankDiff !== 0) return rankDiff;
  const da = a.nextReviewDate ? +parseLocalDate(a.nextReviewDate) : Infinity;
  const db = b.nextReviewDate ? +parseLocalDate(b.nextReviewDate) : Infinity;
  return da - db;
}
