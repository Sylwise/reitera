import { motion } from 'framer-motion';
import StatusTag from './StatusTag';
import { getTopicStatus, formatDaysLabel, getAsigColor } from '../../utils/topicHelpers';
import { useLongPress } from '../../hooks/useLongPress';

export default function TopicCard({ topic, subjects = [], onMark, onConfigure, onEditTopic, hideAsig = false, slotNum }) {
  const status    = getTopicStatus(topic);
  const longPress = useLongPress();

  function handleContextMenu(e) {
    if (!onEditTopic) return;
    e.preventDefault();
    onEditTopic(topic);
  }

  if (status === 'empty') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="topic-card empty"
      >
        <div className="topic-empty-text">
          Tema {slotNum} — vacío
        </div>
        {onConfigure && (
          <button
            className="btn-configure"
            onClick={e => { e.stopPropagation(); onConfigure(topic); }}
          >
            Configurar
          </button>
        )}
      </motion.div>
    );
  }

  const fillPct   = Math.round(topic.reviewCount / topic.reviewsNeeded * 100);
  const fillColor =
    status === 'overdue'  ? 'var(--danger)' :
    status === 'mastered' ? 'var(--ok)'     :
    status === 'soon'     ? 'var(--warn)'   : 'var(--accent)';
  const canMark      = status === 'today' || status === 'overdue';
  const dotColor     = getAsigColor(topic.subjectId, subjects);
  const subjectName  = subjects.find(s => s.id === topic.subjectId)?.name ?? '';

  function handleClick() {
    if (longPress.didTrigger()) return;
    if (canMark && onMark) onMark(topic);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={`topic-card ${status}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={() => longPress.onStart(onEditTopic ? () => onEditTopic(topic) : null)}
      onTouchEnd={longPress.onEnd}
      onTouchMove={longPress.onEnd}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <div className="card-left">
        {!hideAsig && (
          <div className="card-asig">
            <span className="topic-asig-dot" style={{ background: dotColor }} />
            {subjectName}
          </div>
        )}
        <div className="card-name">{topic.name}</div>
      </div>

      <div className="card-progress">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${fillPct}%`, background: fillColor }} />
        </div>
        <div className="progress-label">
          <span>Repaso {topic.reviewCount}/{topic.reviewsNeeded}</span>
          <span className="hide-on-mobile" style={{ color: status === 'overdue' ? 'var(--danger)' : 'var(--muted)' }}>
            {formatDaysLabel(topic)}
          </span>
        </div>
      </div>

      <div className="card-action">
        {status === 'mastered' && <StatusTag status="mastered" />}
        {status === 'today' && (
          <>
            <button className="btn-done" onClick={e => { e.stopPropagation(); onMark && onMark(topic); }}>Marcar ✓</button>
            <span className="rep-badge hide-on-mobile">HOY</span>
          </>
        )}
        {status === 'overdue' && (
          <>
            <button className="btn-done" onClick={e => { e.stopPropagation(); onMark && onMark(topic); }}>Marcar ✓</button>
            <span className="rep-badge danger hide-on-mobile">{formatDaysLabel(topic)}</span>
          </>
        )}
        {status === 'soon' && (
          <>
            <span className="hide-on-mobile"><StatusTag status="soon" /></span>
            <span className="rep-badge">{formatDaysLabel(topic)}</span>
          </>
        )}
        {status === 'future' && (
          <>
            <span className="hide-on-mobile"><StatusTag status="future" /></span>
            <span className="rep-badge">{formatDaysLabel(topic)}</span>
          </>
        )}
        {onEditTopic && (
          <button
            className="topic-menu-btn"
            onClick={e => { e.stopPropagation(); onEditTopic(topic); }}
            onTouchStart={e => e.stopPropagation()}
            onTouchEnd={e => e.stopPropagation()}
            title="Opciones"
          >
            <svg width="14" height="14" viewBox="0 0 4 16" fill="currentColor">
              <circle cx="2" cy="2" r="1.5" />
              <circle cx="2" cy="8" r="1.5" />
              <circle cx="2" cy="14" r="1.5" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}
