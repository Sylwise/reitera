import { useState, useEffect } from 'react';
import { fetchTopics, fetchTopic, createTopic, updateTopic, deleteTopic, resetTopic } from '../api/topics';
import { addReviewSession } from '../api/reviewSessions';

export function useTopics(showToast) {
  const [topics, setTopics]         = useState([]);
  const [modalTopic, setModalTopic] = useState(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState(null);

  function load() {
    return fetchTopics()
      .then(setTopics)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  function refetch() {
    setError(null);
    setIsLoading(true);
    return load();
  }

  useEffect(() => { load(); }, []);

  async function handleConfirm({ dificultad, score }) {
    const topic = modalTopic;
    try {
      await addReviewSession(topic.id, { dificultad, score });
      const updated = await fetchTopic(topic.id);
      setTopics(prev => prev.map(t => t.id === topic.id ? updated : t));
      const label = dificultad === 'easy' ? 'Fácil' : dificultad === 'hard' ? 'Difícil' : 'Normal';
      showToast(`✓ ${topic.name} — ${label}${score ? ` · ${score}` : ''}`);
      setModalTopic(null);
    } catch (err) {
      showToast(`✗ ${err.message}`);
    }
  }

  async function handleConfigTopic({ subjectId, name, reviewsNeeded }) {
    try {
      const saved = await createTopic({ name, reviewsNeeded, subjectId });
      setTopics(prev => [...prev, saved]);
      showToast(`✓ "${name}" añadido`);
    } catch (err) {
      showToast(`✗ ${err.message}`);
    }
  }

  async function handleEditTopic({ topicId, name, reviewsNeeded }) {
    const existing = topics.find(t => t.id === topicId);
    if (!existing) return;
    try {
      const saved = await updateTopic(topicId, { name, reviewsNeeded, subjectId: existing.subjectId });
      setTopics(prev => prev.map(t => t.id === topicId ? saved : t));
      showToast(`✓ Tema guardado`);
    } catch (err) {
      showToast(`✗ ${err.message}`);
    }
  }

  async function handleDeleteTopic(topicId) {
    try {
      await deleteTopic(topicId);
      setTopics(prev => prev.filter(t => t.id !== topicId));
      showToast(`✓ Tema borrado`);
    } catch (err) {
      showToast(`✗ ${err.message}`);
    }
  }

  async function handleResetTopic(topicId) {
    try {
      const saved = await resetTopic(topicId);
      setTopics(prev => prev.map(t => t.id === topicId ? saved : t));
      showToast(`✓ Repasos reiniciados`);
    } catch (err) {
      showToast(`✗ ${err.message}`);
    }
  }

  return {
    topics, setTopics,
    modalTopic, setModalTopic,
    handleConfirm, handleConfigTopic, handleEditTopic, handleDeleteTopic, handleResetTopic,
    isLoading, error, refetch,
  };
}
