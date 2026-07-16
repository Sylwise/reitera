export default function BarChart({ data, todayIdx = 0, height = 130, className = 'chart', barWrapGap, barLabelStyle }) {
  const maxCount     = Math.max(1, ...data.map(d => d.count));
  const maxBarHeight = Math.max(20, height - 58); // hueco para el contador (arriba, vía padding-top) y la etiqueta del día (abajo)
  return (
    <div className={className} style={{ height }}>
      {data.map((d, i) => {
        const isEmpty = d.count === 0;
        const isToday = i === todayIdx;
        const barH    = isEmpty ? 4 : Math.max(4, Math.round((d.count / maxCount) * maxBarHeight));
        const cls     = isToday ? 'today-bar' : isEmpty ? 'empty-bar' : 'has-reviews';
        return (
          <div key={i} className="bar-wrap" style={barWrapGap != null ? { gap: barWrapGap } : undefined}>
            <div className={`bar ${cls}`} style={{ height: barH }}>
              {!isEmpty && <span className="bar-inner-count">{d.count}</span>}
            </div>
            <div className="bar-label" style={barLabelStyle}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}
