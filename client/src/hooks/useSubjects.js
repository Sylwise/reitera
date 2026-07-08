import { useState } from 'react';
import { INITIAL_SUBJECTS } from '../data/subjects';

export function useSubjects(setTopics, setFocusAsig, showToast) {
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const isLoading = false;
  const error     = null;

  function handleAddSubject({ name, totalTopics, color }) {
    const id = Date.now();
    setSubjects(prev => [...prev, { id, name, color, totalTopics }]);
    showToast(`✓ "${name}" añadida`);
  }

  function handleEditSubject({ id, newName, totalTopics, color }) {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, name: newName, totalTopics, color } : s));
    showToast(`✓ Ajustes guardados`);
  }

  function handleDeleteSubject(id) {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setTopics(prev => prev.filter(t => t.subjectId !== id));
    setFocusAsig(prev => (prev === id ? null : prev));
    showToast(`✓ Asignatura borrada`);
  }

  return {
    subjects, setSubjects,
    handleAddSubject, handleEditSubject, handleDeleteSubject,
    isLoading, error,
  };
}
