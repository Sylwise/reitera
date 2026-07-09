import { apiFetch } from './client';

function toWire(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fromWire(exam) {
  const [y, m, d] = exam.examDate.split('-').map(Number);
  return { id: exam.id, name: exam.name, subjectId: exam.subjectId, date: new Date(y, m - 1, d) };
}

export async function fetchExams() {
  const exams = await apiFetch('/exams');
  return exams.map(fromWire);
}

export async function createExam({ name, subjectId, date }) {
  const saved = await apiFetch('/exams', {
    method: 'POST',
    body: { name, subjectId, examDate: toWire(date) },
  });
  return fromWire(saved);
}

export function deleteExam(id) {
  return apiFetch(`/exams/${id}`, { method: 'DELETE' });
}
