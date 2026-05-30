import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Login      from './views/Login';
import Sidebar    from './components/layout/Sidebar';
import Topbar     from './components/layout/Topbar';
import Dashboard  from './views/Dashboard';
import Temas      from './views/Temas';
import Stats      from './views/Stats';
import Calendario from './views/Calendario';
import AppModals  from './components/modals/AppModals';
import { useToast }    from './hooks/useToast';
import { useTopics }   from './hooks/useTopics';
import { useSubjects } from './hooks/useSubjects';
import { useExams }    from './hooks/useExams';
import { MOCK_STATS }  from './data/topics';

export default function App() {
  const [loggedIn, setLoggedIn]             = useState(false);
  const [view, setView]                     = useState(() => localStorage.getItem('repaso_view') || 'dashboard');
  const [focusAsig, setFocusAsig]           = useState(null);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [configOpen, setConfigOpen]         = useState(false);
  const [configInitAsig, setConfigInitAsig] = useState(null);
  const [editSubject, setEditSubject]       = useState(null);
  const [editTopic, setEditTopic]           = useState(null);

  const { toast, showToast, dismissToast } = useToast();
  const {
    topics, setTopics,
    modalTopic, setModalTopic,
    handleConfirm, handleConfigTopic, handleEditTopic, handleDeleteTopic, handleResetTopic,
  } = useTopics(showToast);
  const {
    subjects,
    handleAddSubject, handleEditSubject, handleDeleteSubject,
  } = useSubjects(setTopics, setFocusAsig, showToast);
  const {
    exams,
    addExamOpen, setAddExamOpen,
    addExamDate,
    handleAddExam, handleDeleteExam, openAddExam,
  } = useExams(showToast);

  useEffect(() => { localStorage.setItem('repaso_view', view); }, [view]);

  function openConfigModal(asig = null) {
    setConfigInitAsig(asig);
    setConfigOpen(true);
  }

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  return (
    <>
      <div className="app-shell">
        <Sidebar
          view={view}
          onViewChange={(v) => { setView(v); setFocusAsig(null); }}
          onSelectSubject={(asig) => { setFocusAsig(asig); setView('temas'); }}
          subjects={subjects}
          topics={topics}
          onAddSubject={() => setAddSubjectOpen(true)}
          onLogout={() => setLoggedIn(false)}
        />

        <div className="main-area">
          <Topbar
            topics={topics}
            subjects={subjects}
            streak={MOCK_STATS.streak}
            onAddTopic={() => openConfigModal(null)}
            onAddSubject={() => setAddSubjectOpen(true)}
            onLogout={() => setLoggedIn(false)}
          />

          <div id="app">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ height: '100%', width: '100%', overflow: 'auto' }}
              >
                {view === 'dashboard'  && <Dashboard  topics={topics} subjects={subjects} onMark={setModalTopic} onEditTopic={setEditTopic} onAddSubject={() => setAddSubjectOpen(true)} isModalOpen={addSubjectOpen} stats={MOCK_STATS} />}
                {view === 'temas'      && <Temas      topics={topics} subjects={subjects} onMark={setModalTopic} onEditTopic={setEditTopic} onEditSubject={setEditSubject} focusAsig={focusAsig} />}
                {view === 'stats'      && <Stats      stats={MOCK_STATS} />}
                {view === 'calendario' && <Calendario topics={topics} subjects={subjects} exams={exams} onAddExam={openAddExam} onDeleteExam={handleDeleteExam} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AppModals
        modalTopic={modalTopic}
        onCloseDoneModal={() => setModalTopic(null)}
        onConfirmDone={handleConfirm}
        addSubjectOpen={addSubjectOpen}
        onCloseAddSubject={() => setAddSubjectOpen(false)}
        onAddSubject={handleAddSubject}
        addExamOpen={addExamOpen}
        onCloseAddExam={() => setAddExamOpen(false)}
        onAddExam={handleAddExam}
        subjects={subjects}
        addExamDate={addExamDate}
        configOpen={configOpen}
        onCloseConfig={() => setConfigOpen(false)}
        onConfirmConfig={handleConfigTopic}
        topics={topics}
        configInitAsig={configInitAsig}
        editSubject={editSubject}
        onCloseEditSubject={() => setEditSubject(null)}
        onEditSubject={handleEditSubject}
        onDeleteSubject={handleDeleteSubject}
        editTopic={editTopic}
        onCloseEditTopic={() => setEditTopic(null)}
        onEditTopic={handleEditTopic}
        onDeleteTopic={handleDeleteTopic}
        onResetTopic={handleResetTopic}
        toast={toast}
        onDismissToast={dismissToast}
      />
    </>
  );
}
