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
    chart30: buildLoadChart(topics, 30),
  };
}

export function buildFocusItems(weakSpots = [], atRisk = []) {
  const map = new Map();
  weakSpots.forEach(w => {
    map.set(w.name, { name: w.name, hardTag: w.tag, scoreTag: null });
  });
  atRisk.forEach(w => {
    if (map.has(w.name)) {
      map.get(w.name).scoreTag = w.tag;
    } else {
      map.set(w.name, { name: w.name, hardTag: null, scoreTag: w.tag });
    }
  });
  return [...map.values()].sort((a, b) => {
    const aScore = (a.hardTag ? 2 : 0) + (a.scoreTag ? 1 : 0);
    const bScore = (b.hardTag ? 2 : 0) + (b.scoreTag ? 1 : 0);
    return bScore - aScore;
  });
}
