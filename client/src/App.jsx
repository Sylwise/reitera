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
import { buildRealStats } from './utils/statsHelpers';
import { getToken, getUser } from './api/client';
import { deleteAccount, logout } from './api/auth';

export default function App() {
  const [loggedIn, setLoggedIn]             = useState(() => !!getToken());
  const [currentUser, setCurrentUser]       = useState(() => getUser());
  const [view, setView]                     = useState(() => localStorage.getItem('repaso_view') || 'dashboard');
  const [focusAsig, setFocusAsig]           = useState(null);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [configOpen, setConfigOpen]         = useState(false);
  const [configInitAsig, setConfigInitAsig] = useState(null);
  const [editSubject, setEditSubject]       = useState(null);
  const [editTopic, setEditTopic]           = useState(null);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

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

  function handleLogout() {
    logout();
    setCurrentUser(null);
    setLoggedIn(false);
  }

  async function handleDeleteAccount() {
    try {
      await deleteAccount();
      handleLogout();
    } catch (err) {
      showToast(`✗ ${err.message}`);
    }
  }

  if (!loggedIn) return <Login onLogin={() => { setCurrentUser(getUser()); setLoggedIn(true); }} />;

  const stats = { ...MOCK_STATS, ...buildRealStats(topics, subjects) };

  return (
    <>
      <div className="app-shell">
        <Sidebar
          view={view}
          onViewChange={(v) => { setView(v); setFocusAsig(null); }}
          onSelectSubject={(asig) => { setFocusAsig(asig); setView('temas'); }}
          subjects={subjects}
          topics={topics}
          userName={currentUser?.name}
          onAddSubject={() => setAddSubjectOpen(true)}
          onLogout={handleLogout}
          onDeleteAccount={() => setDeleteAccountOpen(true)}
        />

        <div className="main-area">
          <Topbar
            topics={topics}
            subjects={subjects}
            streak={stats.streak}
            userName={currentUser?.name}
            onAddTopic={() => openConfigModal(null)}
            onAddSubject={() => setAddSubjectOpen(true)}
            onLogout={handleLogout}
            onDeleteAccount={() => setDeleteAccountOpen(true)}
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
                {view === 'dashboard'  && <Dashboard  topics={topics} subjects={subjects} onMark={setModalTopic} onEditTopic={setEditTopic} onAddSubject={() => setAddSubjectOpen(true)} isModalOpen={addSubjectOpen} stats={stats} />}
                {view === 'temas'      && <Temas      topics={topics} subjects={subjects} onMark={setModalTopic} onEditTopic={setEditTopic} onEditSubject={setEditSubject} focusAsig={focusAsig} />}
                {view === 'stats'      && <Stats      stats={stats} />}
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
        deleteAccountOpen={deleteAccountOpen}
        onCloseDeleteAccount={() => setDeleteAccountOpen(false)}
        onConfirmDeleteAccount={handleDeleteAccount}
        toast={toast}
        onDismissToast={dismissToast}
      />
    </>
  );
}
