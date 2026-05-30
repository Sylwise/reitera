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
