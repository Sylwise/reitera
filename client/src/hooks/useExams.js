import { useState, useEffect } from 'react';
import { fetchExams, createExam, deleteExam } from '../api/exams';

export function useExams(showToast) {
  const [exams, setExams]             = useState([]);
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

  async function handleAddExam({ name, subjectId, date }) {
    try {
      const saved = await createExam({ name, subjectId, date });
      setExams(prev => [...prev, saved]);
      showToast(`📅 Examen "${name}" añadido`);
    } catch (err) {
      showToast(`✗ ${err.message}`);
    }
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
