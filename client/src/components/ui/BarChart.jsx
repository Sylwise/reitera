export default function BarChart({ data, todayIdx = 0, height = 130 }) {
  return (
    <div className="chart" style={{ height }}>
      {data.map((d, i) => {
        const isEmpty = d.count === 0;
        const isToday = i === todayIdx;
        const barH    = isEmpty ? 20 : d.count * 20;
        const cls     = isToday ? 'today-bar' : isEmpty ? 'empty-bar' : 'has-reviews';
        return (
          <div key={i} className="bar-wrap">
            <div className={`bar ${cls}`} style={{ height: barH }}>
              {!isEmpty && <span className="bar-inner-count">{d.count}</span>}
            </div>
            <div className="bar-label">{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}
