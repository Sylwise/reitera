import { AnimatePresence } from 'framer-motion';
import Panel from '../components/ui/Panel';
import SectionLabel from '../components/ui/SectionLabel';
import BarChart from '../components/ui/BarChart';
import TopicCard from '../components/ui/TopicCard';
import EmptyDashboard from './EmptyDashboard';
import { getTopicStatus, getAsigColor, formatDaysLabel } from '../utils/topicHelpers';
import { buildFocusItems } from '../utils/statsHelpers';

export default function Dashboard({ topics, subjects, onMark, onAddSubject, isModalOpen, stats }) {
  if (subjects.length === 0) return <EmptyDashboard onAddSubject={onAddSubject} isModalOpen={isModalOpen} />;
  const overdue  = topics.filter(t => getTopicStatus(t) === 'overdue');
  const todayDue = topics.filter(t => getTopicStatus(t) === 'today');
  const due      = [...overdue, ...todayDue];
  const upcoming = topics
    .filter(t => ['soon', 'future'].includes(getTopicStatus(t)))
    .sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate))
    .slice(0, 5);

  const mastered = topics.filter(t => getTopicStatus(t) === 'mastered').length;
  const totalCourseTopics = subjects.reduce((sum, s) => sum + s.totalTopics, 0);
  const pct = totalCourseTopics > 0 ? Math.round((mastered / totalCourseTopics) * 100) : 0;

  const chart7  = (stats.chart7 || []).map((count, i) => ({ count, label: (stats.chart7Labels || [])[i] || '' }));
  const dateStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dateCap = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  return (
    <div className="page-wrap">
      <main id="dash-main">

        <div className="hero fade-in">
          <div>
            <div className="hero-date">{dateCap}</div>
            <div className="hero-title">
              <span>{due.length}</span> tema{due.length !== 1 ? 's' : ''} pendiente{due.length !== 1 ? 's' : ''}
            </div>
            <div className="hero-sub">
              {due.length === 0 ? '¡Todo al día! Disfruta el día.' : 'Tienes la racha — no la rompas ahora.'}
            </div>
          </div>
          <div className="hero-meta">
            <div className="hero-pct">{pct}%</div>
            <div className="hero-pct-label">del curso afianzado</div>
          </div>
        </div>

        <div className="col-left">
          <div>
            <SectionLabel count={due.length}>Para hoy</SectionLabel>
            {due.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: '.6rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>🎉</div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '.35rem', letterSpacing: '-.01em' }}>¡Todo al día!</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '.78rem', color: 'var(--muted)' }}>Racha activa — vuelve mañana.</div>
              </div>
            )}
            <AnimatePresence mode="popLayout">
              {due.map((t, i) => (
                <TopicCard key={t.id} topic={t} subjects={subjects} onMark={onMark} delay={0.05 + i * 0.05} />
              ))}
            </AnimatePresence>
          </div>

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
          <Panel title="Carga próximos 7 días" delay={0.1}>
            <BarChart data={chart7} todayIdx={0} height={110} />
          </Panel>

          {(() => {
            const items = buildFocusItems(stats.weakSpots, stats.atRisk);
            return (
              <Panel title="Foco de atención" delay={0.15}>
                {items.length === 0 && (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.78rem', color: 'var(--muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                    Sin alertas activas 🎉
                  </div>
                )}
                {items.map((item) => (
                  <div key={item.name} className="risk-row">
                    <div className="risk-name">{item.name}</div>
                    <div style={{ display: 'flex', gap: '.35rem', flexShrink: 0 }}>
                      {item.hardTag && <span className="risk-tag hard">{item.hardTag}</span>}
                      {item.scoreTag && <span className="risk-tag score">{item.scoreTag}</span>}
                    </div>
                  </div>
                ))}
              </Panel>
            );
          })()}
        </div>

      </main>
    </div>
  );
}
