import Panel from '../components/ui/Panel';
import Spinner from '../components/ui/Spinner';
import DonutChart from '../components/charts/DonutChart';

const WEEK_LABELS  = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const INSIGHT_TEXT = 'Vas genial en IPE, pero Sistemas Informáticos necesita tu atención esta semana.';

function buildHeatmapDates(activity) {
  const today = new Date();
  return activity.map((v, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (activity.length - 1 - i));
    const mon = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
    const tip = `${d.getDate()} ${mon} · ${v} repaso${v !== 1 ? 's' : ''}`;
    return { v, tip, d };
  });
}

export default function Stats({ stats }) {
  if (!stats) return <Spinner />;

  const { streak, totalRepasos, overdue, diffDistribution, chart30, asigProgress, activity } = stats;
  const masteredTotal = asigProgress.reduce((s, a) => s + a.done, 0);
  const heatmapData   = buildHeatmapDates(activity);
  const weekHeaders   = [0, 7, 14, 21, 28].map(idx => {
    const d = heatmapData[idx]?.d;
    if (!d) return { day: '', mon: '' };
    return { day: d.getDate(), mon: d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase() };
  });

  const chart30data = chart30.map((count, i) => ({
    count, label: i === 0 ? 'Hoy' : i % 5 === 0 ? `${i}d` : '',
  }));

  return (
    <div className="page-wrap">
      <div className="stats-grid fade-in">
        {[
          { label: 'Afianzados',      value: masteredTotal,   cls: 'accent', sub: `de ${asigProgress.reduce((s, a) => s + a.total, 0)} temas totales` },
          { label: 'Racha actual',    value: `🔥 ${streak}`,  cls: 'accent', sub: 'días consecutivos' },
          { label: 'Repasos totales', value: totalRepasos,    cls: 'ok',     sub: 'sesiones completadas' },
          { label: 'Atrasados',       value: overdue,         cls: 'danger', sub: 'temas con retraso' },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className={`metric-value ${k.cls}`}>{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="stats-row fade-in" style={{ animationDelay: '.1s' }}>
        <Panel title="Carga — próximos 30 días">
          <div className="big-chart">
            {chart30data.map((d, i) => {
              const isEmpty = d.count === 0;
              const isToday = i === 0;
              const barH    = isEmpty ? 20 : d.count * 20;
              const cls     = isToday ? 'today-bar' : isEmpty ? 'empty-bar' : 'has-reviews';
              return (
                <div key={i} className="bar-wrap" style={{ gap: 2 }}>
                  <div className={`bar ${cls}`} style={{ height: barH }}>
                    {!isEmpty && <span className="bar-inner-count">{d.count}</span>}
                  </div>
                  <div className="bar-label" style={{ fontSize: '.55rem' }}>{d.label}</div>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="Distribución de dificultad">
          <DonutChart
            easy={diffDistribution.easy}
            normal={diffDistribution.normal}
            hard={diffDistribution.hard}
          />
        </Panel>
      </div>

      <div className="stats-row fade-in" style={{ animationDelay: '.2s', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Panel title="Progreso por asignatura" style={{ height: 'fit-content' }}>
            {asigProgress.map(a => {
              const pct = Math.round(a.done / a.total * 100);
              return (
                <div key={a.name} className="asig-stat-row">
                  <div className="asig-stat-header">
                    <span className="asig-stat-name" style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: a.color, display: 'inline-block', flexShrink: 0 }} />
                      {a.name}
                    </span>
                    <span className="asig-stat-pct">{a.done}/{a.total} · {pct}%</span>
                  </div>
                  <div className="asig-stat-track">
                    <div className="asig-stat-fill" style={{ width: `${pct}%`, background: a.color }} />
                  </div>
                </div>
              );
            })}
          </Panel>

          <div className="panel fade-in" style={{ height: 'fit-content', background: `linear-gradient(135deg, rgba(var(--accent-rgb),.06) 0%, rgba(var(--accent-rgb),.02) 100%)`, border: `1px solid rgba(var(--accent-rgb),.15)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.6rem' }}>
              <span style={{ fontSize: '1rem' }}>✨</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '.65rem', color: 'var(--accent)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Insight Semanal</span>
            </div>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '.85rem', lineHeight: 1.6, color: 'var(--text)', margin: 0 }}>
              {INSIGHT_TEXT}
            </p>
          </div>
        </div>

        <Panel title="Actividad — últimas 5 semanas" style={{ alignSelf: 'start' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gridTemplateRows: 'auto auto', columnGap: '.5rem', rowGap: '5px' }}>
            <div />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5 }}>
              {weekHeaders.map((w, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.62rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{w.day}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.52rem', color: 'var(--muted)', lineHeight: 1.2 }}>{w.mon}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {WEEK_LABELS.map(l => (
                <div key={l} style={{ height: 34, display: 'flex', alignItems: 'center', fontFamily: 'var(--mono)', fontSize: '.62rem', color: 'var(--muted)' }}>{l}</div>
              ))}
            </div>
            <div className="streak-grid">
              {heatmapData.map((d, i) => (
                <div key={i} className={`streak-day done-${Math.min(d.v, 4)}`} data-tip={d.tip} />
              ))}
            </div>
          </div>
          <div className="streak-legend">
            <span>Menos</span>
            {[0, 1, 2, 3, 4].map(v => <div key={v} className={`streak-swatch streak-day done-${v}`} />)}
            <span>Más</span>
          </div>
        </Panel>
      </div>
    </div>
  );
}
