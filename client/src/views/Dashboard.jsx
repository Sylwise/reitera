import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Panel from '../components/ui/Panel';
import SectionLabel from '../components/ui/SectionLabel';
import BarChart from '../components/ui/BarChart';
import TopicCard from '../components/ui/TopicCard';
import Skeleton from '../components/ui/Skeleton';
import AsyncSection from '../components/ui/AsyncSection';
import EmptyDashboard from './EmptyDashboard';
import { getTopicStatus, getAsigColor, formatDaysLabel, compareByUrgency } from '../utils/topicHelpers';
import { buildFocusItems } from '../utils/statsHelpers';

function TopicCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-row">
        <Skeleton w={8} h={8} r="50%" />
        <Skeleton w="45%" h={13} />
        <Skeleton w={54} h={18} r={9} style={{ marginLeft: 'auto' }} />
      </div>
      <Skeleton w="30%" h={10} />
    </div>
  );
}

function DueListSkeleton() {
  return (
    <div>
      <SectionLabel>Para hoy</SectionLabel>
      {[0, 1, 2].map(i => <TopicCardSkeleton key={i} />)}
    </div>
  );
}

function PanelSkeleton({ title, rows }) {
  return (
    <Panel title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem', padding: '.4rem 0' }}>
        {Array.from({ length: rows }, (_, i) => <Skeleton key={i} h={14} w={`${90 - i * 12}%`} />)}
      </div>
    </Panel>
  );
}

export default function Dashboard({ topics, subjects, onMark, onEditTopic, onAddSubject, isModalOpen, stats, onNavigateTopic, showToast, coreState, statsState }) {
  // En móvil no hay botón "Marcar": pista de una sola vez para que el tap sea descubrible.
  useEffect(() => {
    if (!showToast || window.innerWidth > 768) return;
    if (localStorage.getItem('hintTapToMark')) return;
    if (!topics?.some(t => ['today', 'overdue'].includes(getTopicStatus(t)))) return;
    localStorage.setItem('hintTapToMark', '1');
    showToast('Toca una tarjeta para marcar el repaso');
  }, [topics, showToast]);

  const coreReady = !coreState.isLoading && !coreState.error && topics && subjects;

  // El onboarding sólo es legítimo cuando sabemos de verdad que no hay asignaturas.
  if (coreReady && subjects.length === 0) {
    return <EmptyDashboard onAddSubject={onAddSubject} isModalOpen={isModalOpen} />;
  }

  const due = coreReady
    ? topics.filter(t => ['overdue', 'today'].includes(getTopicStatus(t))).sort(compareByUrgency)
    : [];
  const upcoming = coreReady
    ? topics
        .filter(t => ['soon', 'future'].includes(getTopicStatus(t)))
        .sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate))
        .slice(0, 5)
    : [];

  const mastered = coreReady ? topics.filter(t => getTopicStatus(t) === 'mastered').length : 0;
  const totalCourseTopics = coreReady ? subjects.reduce((sum, s) => sum + s.totalTopics, 0) : 0;
  const pct = totalCourseTopics > 0 ? Math.round((mastered / totalCourseTopics) * 100) : 0;

  const chart7 = (stats?.chart7 || []).map((count, i) => ({ count, label: (stats?.chart7Labels || [])[i] || '' }));

  return (
    <div className="page-wrap">
      <main id="dash-main">

        <div className="hero fade-in" style={coreState.error ? { display: 'none' } : undefined}>
          {coreReady ? (
            <>
              <div>
                <div className="hero-title">
                  <span className="hero-num">{due.length}</span> <span className="hero-title-label">tema{due.length !== 1 ? 's' : ''} pendiente{due.length !== 1 ? 's' : ''}</span>
                </div>
                {due.length > 0 && (
                  <div className="hero-sub">
                    {stats?.streak >= 2 ? 'Tienes la racha — no la rompas ahora.' : 'Un repaso hoy y te lo quitas de encima.'}
                  </div>
                )}
              </div>
              <div className="hero-meta">
                <div className="hero-pct">{pct}%</div>
                <div className="hero-pct-label">del curso afianzado</div>
              </div>
            </>
          ) : (
            <>
              <div>
                <Skeleton w={210} h={40} />
              </div>
              <div className="hero-meta">
                <Skeleton w={110} h={40} style={{ marginLeft: 'auto' }} />
              </div>
            </>
          )}
        </div>

        <div className="col-left">
          <AsyncSection
            isLoading={coreState.isLoading}
            error={coreState.error}
            onRetry={coreState.retry}
            skeleton={<DueListSkeleton />}
          >
            <div>
              <SectionLabel>Para hoy</SectionLabel>
              {due.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: '.6rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '.35rem', letterSpacing: '-.01em' }}>¡Todo al día!</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.78rem', color: 'var(--muted)' }}>Racha activa — vuelve mañana.</div>
                </div>
              )}
              <div className="due-list">
                <AnimatePresence mode="popLayout">
                  {due.map(t => (
                    <TopicCard key={t.id} topic={t} subjects={subjects ?? []} onMark={onMark} onEditTopic={onEditTopic} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </AsyncSection>

          {upcoming.length > 0 && (
            <div>
              <SectionLabel>Próximamente</SectionLabel>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                {upcoming.map((t, i) => (
                  <div
                    key={t.id}
                    className="fade-in"
                    style={{ display: 'flex', alignItems: 'center', gap: '.65rem', padding: '.5rem .9rem', borderBottom: i < upcoming.length - 1 ? '1px solid var(--border)' : 'none', animationDelay: `${0.2 + i * 0.04}s` }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: getAsigColor(t.subjectId, subjects), flexShrink: 0 }} />
                    <span style={{ fontSize: '.83rem', fontWeight: 500, flex: 1, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '.7rem', color: getTopicStatus(t) === 'soon' ? 'var(--warn)' : 'var(--muted)', flexShrink: 0 }}>{formatDaysLabel(t)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-right">
          <AsyncSection
            isLoading={statsState.isLoading}
            error={statsState.error}
            onRetry={statsState.retry}
            skeleton={
              <>
                <PanelSkeleton title="Carga próximos 7 días" rows={4} />
                <PanelSkeleton title="Foco de atención" rows={3} />
              </>
            }
          >
          <Panel title="Carga próximos 7 días" delay={0.1}>
            <BarChart data={chart7} todayIdx={0} height={110} />
          </Panel>

          {(() => {
            const items = buildFocusItems(stats?.weakSpots, stats?.atRisk);
            return (
              <Panel title="Foco de atención" delay={0.15}>
                {items.length === 0 && (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.78rem', color: 'var(--muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                    Sin alertas activas
                  </div>
                )}
                {items.map((item) => {
                  const subjectId = subjects.find(s => s.name === item.subjectName)?.id;
                  return (
                    <div
                      key={item.topicId}
                      className={`risk-row${onNavigateTopic ? ' clickable' : ''}`}
                      onClick={onNavigateTopic ? () => onNavigateTopic(topics.find(t => t.id === item.topicId) ?? { id: item.topicId }) : undefined}
                      title={onNavigateTopic ? 'Ir al tema' : undefined}
                    >
                      <div className="risk-row-top">
                        <span className="risk-dot" style={{ background: getAsigColor(subjectId, subjects) }} />
                        <div className="risk-name" title={`${item.subjectName} · ${item.topicName}`}>{item.topicName}</div>
                      </div>
                      {(item.hardTag || item.scoreTag) && (
                        <div className="risk-tags">
                          {item.hardTag && <span className="risk-tag hard">{item.hardTag}</span>}
                          {item.scoreTag && <span className="risk-tag score">{item.scoreTag}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Panel>
            );
          })()}
          </AsyncSection>
        </div>

      </main>
    </div>
  );
}
