import { motion } from 'framer-motion';
import StatusTag from './StatusTag';
import { getTopicStatus, formatDaysLabel, getAsigColor, MASTERY_THRESHOLD_DAYS } from '../../utils/topicHelpers';
import { useLongPress } from '../../hooks/useLongPress';

export default function TopicCard({ topic, subjects = [], onMark, onEditTopic, hideAsig = false, highlighted = false }) {
  const status    = getTopicStatus(topic);
  const longPress = useLongPress();

  function handleContextMenu(e) {
    if (!onEditTopic) return;
    e.preventDefault();
    onEditTopic(topic);
  }

  const fillPct   = status === 'mastered' ? 100 : Math.round(topic.displayedProgressDays / MASTERY_THRESHOLD_DAYS * 100);
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
      id={`topic-card-${topic.id}`}
      className={`topic-card ${status}${highlighted ? ' highlight-pulse' : ''}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={() => longPress.onStart(onEditTopic ? () => onEditTopic(topic) : null)}
      onTouchEnd={longPress.onEnd}
      onTouchMove={longPress.onEnd}
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
        <div className="progress-label">
          <span>{topic.reviewCount === 0 ? 'Sin repasos' : `Repaso ${topic.reviewCount}`}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${fillPct}%` }} />
        </div>
        <span className={`progress-days ${status}`}>
          {status !== 'mastered' ? formatDaysLabel(topic) : ''}
        </span>
      </div>

      <div className="card-action">
        {status === 'mastered' && <StatusTag status="mastered" />}
        {canMark && (
          <button className="btn-done" onClick={e => { e.stopPropagation(); onMark && onMark(topic); }}>Repasado ✓</button>
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
