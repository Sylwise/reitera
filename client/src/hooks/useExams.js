import { useState } from 'react';
import { MOCK_EXAMS } from '../data/topics';

export function useExams(showToast) {
  const [exams, setExams]           = useState(MOCK_EXAMS);
  const [addExamOpen, setAddExamOpen] = useState(false);
  const [addExamDate, setAddExamDate] = useState(new Date());
  const isLoading = false;
  const error     = null;

  function handleAddExam({ name, subjectId, date }) {
    const id = 'exam_' + Date.now();
    setExams(prev => [...prev, { id, name, subjectId, date }]);
    showToast(`📅 Evento "${name}" añadido`);
  }

  function handleDeleteExam(id) {
    setExams(prev => prev.filter(e => e.id !== id));
    showToast('✓ Evento borrado');
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
    isLoading, error,
  };
}
