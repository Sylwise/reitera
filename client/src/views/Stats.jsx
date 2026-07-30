import { useState } from 'react';
import Panel from '../components/ui/Panel';
import Skeleton from '../components/ui/Skeleton';
import AsyncSection from '../components/ui/AsyncSection';
import DonutChart from '../components/charts/DonutChart';
import UpcomingLoadTimeline from '../components/charts/UpcomingLoadTimeline';
import EmptyStats from './EmptyStats';
import { shortMonth } from '../utils/dateHelpers';

const WEEK_LABELS  = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// La ventana (30 o 15 días) la decide el timeline a partir del ancho que mide de su
// propio panel, y nos la comunica para que el título diga lo mismo que el eje. Esta
// estimación por viewport es solo el valor inicial, para que el esqueleto no enseñe
// un número que cambie en cuanto monta el componente real.
function guessLoadWindowDays() {
  return window.innerWidth >= 1080 ? 30 : 15;
}

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
    const mon = shortMonth(d);
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
    return { day: d.getDate(), mon: shortMonth(d).toUpperCase() };
  });

  return { cells, numCols, weekHeaders };
}

function StatsSkeleton({ loadDays }) {
  return (
    <>
      <div className="stats-grid">
        {/* 3 y no 4: el grid real tiene 3 tarjetas (2 si no hay atrasados) */}
        {[0, 1, 2].map(i => (
          <div key={i} className="kpi-card">
            <Skeleton w="55%" h={10} />
            <Skeleton w={64} h={30} style={{ margin: '.7rem 0 .55rem' }} />
            <Skeleton w="75%" h={10} />
          </div>
        ))}
      </div>

      <div className="stats-row">
        <Panel title={`Carga — próximos ${loadDays} días`}><Skeleton h={120} /></Panel>
        <Panel title="Distribución de dificultad"><Skeleton h={120} /></Panel>
      </div>

      <div className="stats-row" style={{ alignItems: 'start' }}>
        <Panel title="Progreso por asignatura">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
            {[0, 1, 2].map(i => (
              <div key={i}>
                <Skeleton w="60%" h={11} style={{ marginBottom: '.45rem' }} />
                <Skeleton h={6} r={3} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Actividad — últimas 5 semanas"><Skeleton h={220} /></Panel>
      </div>
    </>
  );
}

export default function Stats({ stats, onAddSubject, onGoToTemas, statsState }) {
  const [loadDays, setLoadDays] = useState(guessLoadWindowDays);
  const ready = !statsState.isLoading && !statsState.error && stats;

  // El "aún no hay nada que enseñar" sólo tras confirmar que la carga fue bien.
  if (ready && stats.totalRepasos === 0) {
    return (
      <EmptyStats
        hasSubjects={stats.asigProgress.length > 0}
        onAddSubject={onAddSubject}
        onGoToTemas={onGoToTemas}
      />
    );
  }

  return (
    <div className="page-wrap">
      <AsyncSection
        isLoading={statsState.isLoading || !stats}
        error={statsState.error}
        onRetry={statsState.retry}
        skeleton={<StatsSkeleton loadDays={loadDays} />}
      >
        <StatsContent stats={stats} loadDays={loadDays} onWindowChange={setLoadDays} />
      </AsyncSection>
    </div>
  );
}

function StatsContent({ stats, loadDays, onWindowChange }) {
  const { totalRepasos, overdue, diffDistribution, upcomingLoad, asigProgress, activity, weeklyInsight } = stats;

  const masteredTotal = asigProgress.reduce((s, a) => s + a.done, 0);
  const { cells: heatmapData, numCols, weekHeaders } = buildHeatmapDates(activity);

  return (
    <>
      <div className="stats-grid fade-in">
        {[
          { label: 'Afianzados',      value: masteredTotal,   cls: 'accent', sub: `de ${asigProgress.reduce((s, a) => s + a.total, 0)} temas totales` },
          { label: 'Repasos totales', value: totalRepasos,    cls: 'ok',     sub: totalRepasos === 1 ? 'sesión completada' : 'sesiones completadas' },
          // Sin atrasados no hay nada que avisar: la tarjeta se cae y el grid se reajusta.
          ...(overdue > 0 ? [{ label: 'Atrasados', value: overdue, cls: 'danger', sub: overdue === 1 ? 'tema con retraso' : 'temas con retraso' }] : []),
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className={`metric-value ${k.cls}`}>{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="stats-row fade-in" style={{ animationDelay: '.1s' }}>
        <Panel title={`Carga — próximos ${loadDays} días`}>
          <UpcomingLoadTimeline milestones={upcomingLoad} onWindowChange={onWindowChange} />
        </Panel>
        <Panel title="Distribución de dificultad">
          <DonutChart
            easy={diffDistribution.easy}
            normal={diffDistribution.normal}
            hard={diffDistribution.hard}
            again={diffDistribution.again}
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
            <div style={{ marginBottom: '.6rem' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '.7rem', color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Insight Semanal</span>
            </div>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '.85rem', lineHeight: 1.6, color: 'var(--muted)', margin: 0, overflowWrap: 'break-word' }}>
              {weeklyInsight}
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
    </>
  );
}
