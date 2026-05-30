import { useState } from 'react';
import { INITIAL_SUBJECTS } from '../data/subjects';

export function useSubjects(setTopics, setFocusAsig, showToast) {
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const isLoading = false;
  const error     = null;

  function handleAddSubject({ name, totalTopics, color }) {
    const id = Date.now();
    setSubjects(prev => [...prev, { id, name, color, totalTopics }]);
    const emptySlots = Array.from({ length: totalTopics }, (_, i) => ({
      id: id + i + 1, subjectId: id, name: null, reviewCount: 0, reviewsNeeded: 4, nextReviewDate: null,
    }));
    setTopics(prev => [...prev, ...emptySlots]);
    showToast(`✓ "${name}" añadida`);
  }

  function handleEditSubject({ id, newName, totalTopics, color }) {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, name: newName, totalTopics, color } : s));

    setTopics(prev => {
      const subjectTopics = prev.filter(t => t.subjectId === id);
      const currentTotal  = subjectTopics.length;

      if (totalTopics > currentTotal) {
        const extra = Array.from({ length: totalTopics - currentTotal }, (_, i) => ({
          id: Date.now() + i,
          subjectId: id,
          name: null,
          reviewCount: 0,
          reviewsNeeded: 4,
          nextReviewDate: null,
        }));
        return [...prev, ...extra];
      }
      if (totalTopics < currentTotal) {
        const emptySlots  = subjectTopics.filter(t => !t.name);
        const toRemove    = currentTotal - totalTopics;
        let removed = 0;
        const idsToRemove = new Set();
        for (let i = emptySlots.length - 1; i >= 0 && removed < toRemove; i--) {
          idsToRemove.add(emptySlots[i].id);
          removed++;
        }
        return prev.filter(t => !idsToRemove.has(t.id));
      }
      return prev;
    });

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
