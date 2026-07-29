import { useState, useEffect } from 'react';
import { fetchExams, createExam, deleteExam } from '../api/exams';

export function useExams(showToast) {
  const [exams, setExams]             = useState(null);
  const [addExamOpen, setAddExamOpen] = useState(false);
  const [addExamDate, setAddExamDate] = useState(new Date());
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState(null);

  function load() {
    return fetchExams()
      .then(setExams)
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
  async function handleAddExam({ name, subjectId, date }) {
    const saved = await createExam({ name, subjectId, date });
    setExams(prev => [...(prev ?? []), saved]);
    showToast(`📅 Examen "${name}" añadido`);
  }

  async function handleDeleteExam(id) {
    try {
      await deleteExam(id);
      setExams(prev => prev.filter(e => e.id !== id));
      showToast('✓ Examen borrado');
    } catch (err) {
      showToast(`✗ ${err.message}`);
    }
  }

  function openAddExam(date) {
    setAddExamDate(date);
    setAddExamOpen(true);
  }

  return {
    exams,
    addExamOpen, setAddExamOpen,
    addExamDate,
    handleAddExam, handleDeleteExam, openAddExam,
    isLoading, error, refetch,
  };
}
