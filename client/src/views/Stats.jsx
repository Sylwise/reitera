import Panel from '../components/ui/Panel';
import Spinner from '../components/ui/Spinner';
import DonutChart from '../components/charts/DonutChart';
import BarChart from '../components/ui/BarChart';
import EmptyStats from './EmptyStats';

const WEEK_LABELS  = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function buildHeatmapDates(activity) {
  const today    = new Date();
  const todayDow = (today.getDay() + 6) % 7; // Monday=0 ... Sunday=6, matches WEEK_LABELS order

  // Backend always sends a fixed 35-day trailing window. Keep only the current
  // week (partial, up to today) plus the 4 full calendar weeks before it, so the
  // grid always aligns to real Monday-Sunday weeks and always renders 5 columns.
  const daysNeeded = 28 + todayDow + 1;
  const sliced     = activity.slice(activity.length - daysNeeded);

  const days = sliced.map((v, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (daysNeeded - 1 - i));
    const mon = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
    const tip = `${d.getDate()} ${mon} · ${v} repaso${v !== 1 ? 's' : ''}`;
    return { v, tip, d };
  });

  const trailingPad = 6 - todayDow; // empty cells after today, completing the current week's column
  const cells   = [...days, ...Array(trailingPad).fill(null)];
  const numCols = cells.length / 7;

  const mondayOfFirstCol = days[0].d; // days[0] is always the Monday of 4 weeks ago
  const weekHeaders = Array.from({ length: numCols }, (_, c) => {
    const d = new Date(mondayOfFirstCol);
    d.setDate(d.getDate() + c * 7);
    return { day: d.getDate(), mon: d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase() };
  });

  return { cells, numCols, weekHeaders };
}

export default function Stats({ stats, onAddSubject, onGoToTemas }) {
  if (!stats) return <Spinner />;

  const { streak, totalRepasos, overdue, diffDistribution, chart30, asigProgress, activity } = stats;

  if (totalRepasos === 0) {
    return (
      <EmptyStats
        hasSubjects={asigProgress.length > 0}
        onAddSubject={onAddSubject}
        onGoToTemas={onGoToTemas}
      />
    );
  }

  const masteredTotal = asigProgress.reduce((s, a) => s + a.done, 0);
  const { cells: heatmapData, numCols, weekHeaders } = buildHeatmapDates(activity);

  const chart30data = chart30.map((count, i) => ({
    count, label: i === 0 ? 'Hoy' : i % 5 === 0 ? `${i}d` : '',
  }));

  return (
    <div className="page-wrap">
      <div className="stats-grid fade-in">
        {[
          { label: 'Afianzados',      value: masteredTotal,   cls: 'accent', sub: `de ${asigProgress.reduce((s, a) => s + a.total, 0)} temas totales` },
          { label: 'Racha actual',    value: <>{streak >= 3 && <span style={{ fontSize: '1.3rem', verticalAlign: 'middle', marginRight: '.3rem' }}>🔥</span>}{streak}</>, cls: 'accent', sub: 'días consecutivos' },
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
          <BarChart
            data={chart30data}
            todayIdx={0}
            height={120}
            className="big-chart"
            barWrapGap={2}
            barLabelStyle={{ fontSize: '.55rem' }}
          />
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.6rem' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '.65rem', color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Insight Semanal</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--muted)', letterSpacing: '.04em', textTransform: 'uppercase', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '999px', padding: '.2rem .55rem', flexShrink: 0 }}>En desarrollo</span>
            </div>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '.85rem', lineHeight: 1.6, color: 'var(--muted)', margin: 0 }}>
              Estamos preparando recomendaciones personalizadas basadas en tu actividad de repaso. Disponible próximamente.
            </p>
          </div>
        </div>

        <Panel title="Actividad — últimas 5 semanas" style={{ alignSelf: 'start' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gridTemplateRows: 'auto auto', columnGap: '.5rem', rowGap: '5px' }}>
            <div />
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols},1fr)`, gap: 5 }}>
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
            <div className="streak-grid" style={{ gridTemplateColumns: `repeat(${numCols},1fr)` }}>
              {heatmapData.map((d, i) => (
                d
                  ? <div key={i} className={`streak-day done-${Math.min(d.v, 4)}`} data-tip={d.tip} />
                  : <div key={i} />
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
