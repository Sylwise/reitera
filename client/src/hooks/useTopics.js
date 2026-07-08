import { useState } from 'react';
import { INITIAL_TOPICS } from '../data/topics';
import { dateInDays } from '../utils/topicHelpers';

export function useTopics(showToast) {
  const [topics, setTopics]         = useState(INITIAL_TOPICS);
  const [modalTopic, setModalTopic] = useState(null);
  const isLoading = false;
  const error     = null;

  function handleConfirm({ dificultad, score }) {
    const intervals = { easy: 21, normal: 14, hard: 7 };
    setTopics(prev => prev.map(t => {
      if (t.id !== modalTopic.id) return t;
      const newReviewCount = Math.min(t.reviewCount + 1, t.reviewsNeeded);
      const isMastered = newReviewCount >= t.reviewsNeeded;
      return { ...t, reviewCount: newReviewCount, nextReviewDate: isMastered ? null : dateInDays(intervals[dificultad]) };
    }));
    const label = dificultad === 'easy' ? 'Fácil' : dificultad === 'hard' ? 'Difícil' : 'Normal';
    showToast(`✓ ${modalTopic.name} — ${label}${score ? ` · ${score}` : ''}`);
    setModalTopic(null);
  }

  function handleConfigTopic({ subjectId, name, reviewsNeeded }) {
    const topic = {
      id: Date.now(), subjectId, name, reviewCount: 0, reviewsNeeded, nextReviewDate: dateInDays(0),
    };
    setTopics(prev => [...prev, topic]);
    showToast(`✓ "${name}" añadido`);
  }

  function handleEditTopic({ topicId, name, reviewsNeeded }) {
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, name, reviewsNeeded } : t));
    showToast(`✓ Tema guardado`);
  }

  function handleDeleteTopic(topicId) {
    setTopics(prev => prev.filter(t => t.id !== topicId));
    showToast(`✓ Tema borrado`);
  }

  function handleResetTopic(topicId) {
    setTopics(prev => prev.map(t =>
      t.id === topicId ? { ...t, reviewCount: 0, nextReviewDate: dateInDays(0) } : t
    ));
    showToast(`✓ Repasos reiniciados`);
  }

  return {
    topics, setTopics,
    modalTopic, setModalTopic,
    handleConfirm, handleConfigTopic, handleEditTopic, handleDeleteTopic, handleResetTopic,
    isLoading, error,
  };
}
