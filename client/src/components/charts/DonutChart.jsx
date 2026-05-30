const HARD_COLOR = '#ff6b35';

export default function DonutChart({ easy, normal, hard }) {
  const total   = easy + normal + hard;
  const circ    = 2 * Math.PI * 40;
  const easeLen = circ * easy   / total;
  const normLen = circ * normal / total;
  const hardLen = circ * hard   / total;
  const easeOff = 63;
  const normOff = -(easeLen - 63);
  const hardOff = -(easeLen + normLen - 63);

  return (
    <div className="donut-wrap">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r="40" fill="none" stroke="var(--surface2)" strokeWidth="18" />
        <circle cx="55" cy="55" r="40" fill="none" stroke="var(--ok)"
          strokeWidth="18" strokeDasharray={`${easeLen} ${circ - easeLen}`}
          strokeDashoffset={easeOff} strokeLinecap="butt" />
        <circle cx="55" cy="55" r="40" fill="none" stroke="var(--accent)"
          strokeWidth="18" strokeDasharray={`${normLen} ${circ - normLen}`}
          strokeDashoffset={normOff} strokeLinecap="butt" />
        <circle cx="55" cy="55" r="40" fill="none" stroke={HARD_COLOR}
          strokeWidth="18" strokeDasharray={`${hardLen} ${circ - hardLen}`}
          strokeDashoffset={hardOff} strokeLinecap="butt" />
        <text x="55" y="59" textAnchor="middle" fill="var(--text)"
          fontFamily="'JetBrains Mono'" fontSize="11" fontWeight="500">
          {total} rep
        </text>
      </svg>
      <div className="donut-legend">
        {[
          { c: 'var(--ok)',     l: 'Fácil',   v: easy,   p: Math.round(easy   / total * 100) },
          { c: 'var(--accent)', l: 'Normal',  v: normal, p: Math.round(normal / total * 100) },
          { c: HARD_COLOR,      l: 'Difícil', v: hard,   p: Math.round(hard   / total * 100) },
        ].map(r => (
          <div key={r.l} className="legend-row">
            <div className="legend-dot" style={{ background: r.c }} />
            <span className="legend-label">{r.l}</span>
            <span className="legend-val">{r.v} ({r.p}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
