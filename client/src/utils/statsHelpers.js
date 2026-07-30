import { getTopicStatus, daysUntil } from './topicHelpers';

const WEEKDAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function buildLoadChart(topics, days) {
  const counts = new Array(days).fill(0);
  topics.forEach(t => {
    if (t.nextReviewDate === null) return;
    const diff = daysUntil(t.nextReviewDate);
    const idx = diff <= 0 ? 0 : diff;
    if (idx < days) counts[idx] += 1;
  });
  return counts;
}

// Ventana máxima que se construye. El timeline puede pintar menos días si su panel es
// estrecho, así que aquí se genera siempre el máximo y él recorta.
export const MAX_LOAD_WINDOW_DAYS = 30;

// Mismo criterio que buildLoadChart: los atrasados se agrupan en el día 0 junto a
// los de hoy, y la ventana llega hasta el día 29 incluido.
function buildUpcomingLoad(topics, days) {
  const byOffset = new Map();
  topics.forEach(t => {
    if (t.nextReviewDate === null) return;
    const diff   = daysUntil(t.nextReviewDate);
    const offset = diff <= 0 ? 0 : diff;
    if (offset >= days) return;
    if (!byOffset.has(offset)) byOffset.set(offset, []);
    // Se guarda el id además del nombre: dos temas de asignaturas distintas pueden
    // llamarse igual y caer el mismo día, y el nombre solo no sirve como clave.
    byOffset.get(offset).push({ id: t.id, name: t.name });
  });
  return [...byOffset.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([offset, dayTopics]) => ({ offset, count: dayTopics.length, topics: dayTopics }));
}

function buildChart7Labels() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    if (i === 0) return 'Hoy';
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return WEEKDAY_SHORT[d.getDay()];
  });
}

export function buildRealStats(topics, subjects) {
  const overdue = topics.filter(t => getTopicStatus(t) === 'overdue').length;

  const asigProgress = subjects.map(s => ({
    name: s.name,
    color: s.color,
    done: topics.filter(t => t.subjectId === s.id && getTopicStatus(t) === 'mastered').length,
    total: s.totalTopics,
  }));

  return {
    overdue,
    asigProgress,
    chart7: buildLoadChart(topics, 7),
    chart7Labels: buildChart7Labels(),
    upcomingLoad: buildUpcomingLoad(topics, MAX_LOAD_WINDOW_DAYS),
  };
}

const DIFF_KEYS = { EASY: 'easy', NORMAL: 'normal', HARD: 'hard', AGAIN: 'again' };

export const EMPTY_STATS = {
  totalRepasos: 0,
  diffDistribution: { easy: 0, normal: 0, hard: 0, again: 0 },
  activity: new Array(35).fill(0),
  weakSpots: [],
  atRisk: [],
  weeklyInsight: 'Aún no hay suficiente actividad esta semana para comparar asignaturas.',
};

const INSIGHT_TIERS = [
  { min: 9,          text: s => `¡Vas genial en ${s}!` },
  { min: 7.5,        text: s => `Vas bien en ${s}.` },
  { min: 6,          text: s => `Vas decente en ${s}.` },
  { min: 4.5,        text: s => `${s} tiene margen de mejora.` },
  { min: 3,          text: s => `La cosa está preocupante en ${s}.` },
  { min: -Infinity,  text: s => `Deberías echarle un vistazo a ${s} cuanto antes.` },
];

function insightTier(score) {
  return INSIGHT_TIERS.find(t => score >= t.min);
}

function buildWeeklyInsightMessage(weeklyComparison) {
  if (!weeklyComparison) return EMPTY_STATS.weeklyInsight;

  const { best, worst } = weeklyComparison;
  const bestTier = insightTier(best.avgScore);
  const worstTier = insightTier(worst.avgScore);

  if (bestTier === worstTier) {
    return bestTier.text(`${best.subjectName} y ${worst.subjectName}`);
  }

  return `${bestTier.text(best.subjectName)} ${worstTier.text(worst.subjectName)}`;
}

export function mapStatsResponse(raw) {
  if (!raw) return EMPTY_STATS;

  const diffDistribution = { easy: 0, normal: 0, hard: 0, again: 0 };
  (raw.diffDistribution || []).forEach(({ difficulty, count }) => {
    if (DIFF_KEYS[difficulty]) diffDistribution[DIFF_KEYS[difficulty]] = count;
  });

  return {
    totalRepasos: raw.totalReviews ?? 0,
    diffDistribution,
    activity: raw.activity ?? EMPTY_STATS.activity,
    weakSpots: (raw.weakSpots || []).map(w => ({
      topicId: w.topicId,
      topicName: w.topicName,
      subjectName: w.subjectName,
      tag: `Difícil ×${w.hardCount}`,
    })),
    atRisk: (raw.atRisk || []).map(a => ({
      topicId: a.topicId,
      topicName: a.topicName,
      subjectName: a.subjectName,
      tag: `Score ${Math.round(a.avgScore * 10)}%`,
    })),
    weeklyInsight: buildWeeklyInsightMessage(raw.weeklyComparison),
  };
}

export function buildFocusItems(weakSpots = [], atRisk = []) {
  const map = new Map();
  weakSpots.forEach(w => {
    map.set(w.topicId, { topicId: w.topicId, topicName: w.topicName, subjectName: w.subjectName, hardTag: w.tag, scoreTag: null });
  });
  atRisk.forEach(a => {
    if (map.has(a.topicId)) {
      map.get(a.topicId).scoreTag = a.tag;
    } else {
      map.set(a.topicId, { topicId: a.topicId, topicName: a.topicName, subjectName: a.subjectName, hardTag: null, scoreTag: a.tag });
    }
  });
  return [...map.values()].sort((a, b) => {
    const aScore = (a.hardTag ? 2 : 0) + (a.scoreTag ? 1 : 0);
    const bScore = (b.hardTag ? 2 : 0) + (b.scoreTag ? 1 : 0);
    return bScore - aScore;
  });
}
