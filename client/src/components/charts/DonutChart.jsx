const SEGMENTS = [
  { key: 'easy',   label: 'Fácil',    color: 'var(--ok)' },
  { key: 'normal', label: 'Normal',   color: 'var(--accent)' },
  { key: 'hard',   label: 'Difícil',  color: 'var(--danger)' },
  { key: 'again',  label: 'Otra vez', color: 'var(--warn)' },
];

export default function DonutChart({ easy, normal, hard, again = 0 }) {
  const counts = { easy, normal, hard, again };
  const total  = easy + normal + hard + again;
  const circ   = 2 * Math.PI * 40;

  const lens = SEGMENTS.map(s => total > 0 ? circ * counts[s.key] / total : 0);
  const arcs = SEGMENTS.map((s, i) => ({
    ...s,
    len: lens[i],
    off: -(lens.slice(0, i).reduce((a, b) => a + b, 0) - 63),
  }));

  return (
    <div className="donut-wrap">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r="40" fill="none" stroke="var(--surface2)" strokeWidth="18" />
        {arcs.map(a => (
          <circle key={a.key} cx="55" cy="55" r="40" fill="none" stroke={a.color}
            strokeWidth="18" strokeDasharray={`${a.len} ${circ - a.len}`}
            strokeDashoffset={a.off} strokeLinecap="butt" />
        ))}
        <text x="55" y="59" textAnchor="middle" fill="var(--text)"
          fontFamily="var(--mono)" fontSize="11" fontWeight="500">
          {total} rep
        </text>
      </svg>
      <div className="donut-legend">
        {arcs.map(a => (
          <div key={a.key} className="legend-row">
            <div className="legend-dot" style={{ background: a.color }} />
            <span className="legend-label">{a.label}</span>
            <span className="legend-val">{counts[a.key]} ({total > 0 ? Math.round(counts[a.key] / total * 100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
