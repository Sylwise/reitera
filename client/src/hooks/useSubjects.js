import { useState, useEffect } from 'react';
import { fetchSubjects, createSubject, updateSubject, deleteSubject } from '../api/subjects';

export function useSubjects(setTopics, setFocusAsig, showToast) {
  const [subjects, setSubjects] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    return fetchSubjects()
      .then(setSubjects)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  function refetch() {
    setError(null);
    setIsLoading(true);
    return load();
  }

  useEffect(() => { load(); }, []);

  // El fallo se propaga: lo enseña el modal en línea, para no perder lo ya escrito.
  async function handleAddSubject({ name, totalTopics, color }) {
    const saved = await createSubject({ name, totalTopics, color });
    setSubjects(prev => [...(prev ?? []), saved]);
    showToast(`✓ "${name}" añadida`);
  }

  async function handleEditSubject({ id, newName, totalTopics, color }) {
    try {
      const saved = await updateSubject(id, { name: newName, totalTopics, color });
      setSubjects(prev => prev.map(s => s.id === id ? saved : s));
      showToast(`✓ Ajustes guardados`);
    } catch (err) {
      showToast(`✗ ${err.message}`);
    }
  }

  async function handleDeleteSubject(id) {
    try {
      await deleteSubject(id);
      setSubjects(prev => prev.filter(s => s.id !== id));
      setTopics(prev => prev?.filter(t => t.subjectId !== id) ?? prev);
      setFocusAsig(prev => (prev === id ? null : prev));
      showToast(`✓ Asignatura borrada`);
    } catch (err) {
      showToast(`✗ ${err.message}`);
    }
  }

  return {
    subjects, setSubjects,
    handleAddSubject, handleEditSubject, handleDeleteSubject,
    isLoading, error, refetch,
  };
}
