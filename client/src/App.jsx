import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Login      from './views/Login';
import Sidebar    from './components/layout/Sidebar';
import Topbar     from './components/layout/Topbar';
import Dashboard    from './views/Dashboard';
import Temas        from './views/Temas';
import Asignaturas  from './views/Asignaturas';
import Stats        from './views/Stats';
import Calendario   from './views/Calendario';
import AppModals  from './components/modals/AppModals';
import { useToast }    from './hooks/useToast';
import { useTopics }   from './hooks/useTopics';
import { useSubjects } from './hooks/useSubjects';
import { useExams }    from './hooks/useExams';
import { useStats }    from './hooks/useStats';
import { buildRealStats } from './utils/statsHelpers';
import { getToken, getUser } from './api/client';
import { deleteAccount, logout } from './api/auth';

export default function App() {
  const [loggedIn, setLoggedIn]             = useState(() => !!getToken());
  const [currentUser, setCurrentUser]       = useState(() => getUser());
  const [view, setView]                     = useState(() => {
    const saved = localStorage.getItem('repaso_view') || 'dashboard';
    const isMobileOnlyView = saved === 'asignaturas';
    const isDesktop = window.innerWidth > 768;
    return isMobileOnlyView && isDesktop ? 'dashboard' : saved;
  });
  const [focusAsig, setFocusAsig]           = useState(null);
  const [focusTopicId, setFocusTopicId]     = useState(null);
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
    refetch: refetchTopics,
  } = useTopics(showToast);
  const {
    subjects,
    handleAddSubject, handleEditSubject, handleDeleteSubject,
    refetch: refetchSubjects,
  } = useSubjects(setTopics, setFocusAsig, showToast);
  const {
    exams,
    addExamOpen, setAddExamOpen,
    addExamDate,
    handleAddExam, handleDeleteExam, openAddExam,
    refetch: refetchExams,
  } = useExams(showToast);
  const { stats: backendStats, refetch: refetchStats } = useStats();

  useEffect(() => { localStorage.setItem('repaso_view', view); }, [view]);

  useEffect(() => {
    function handleResize() {
      if (view === 'asignaturas' && window.innerWidth > 768) setView('dashboard');
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  async function handleConfirmDone(payload) {
    await handleConfirm(payload);
    refetchStats();
  }

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

  function handleLoginSuccess() {
    setCurrentUser(getUser());
    setLoggedIn(true);
    setView('dashboard');
    refetchTopics();
    refetchSubjects();
    refetchExams();
    refetchStats();
  }

  if (!loggedIn) return <Login onLogin={handleLoginSuccess} />;

  const stats = { ...backendStats, ...buildRealStats(topics, subjects) };

  return (
    <>
      <div className="app-shell">
        <Sidebar
          view={view}
          onViewChange={(v) => { setView(v); setFocusAsig(null); setFocusTopicId(null); }}
          onSelectSubject={(asig) => { setFocusAsig(prev => prev === asig ? null : asig); setFocusTopicId(null); setView('temas'); }}
          onEditSubject={setEditSubject}
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
            onOpenAsignaturas={() => setView('asignaturas')}
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
                {view === 'dashboard'  && <Dashboard  topics={topics} subjects={subjects} onMark={setModalTopic} onEditTopic={setEditTopic} onAddSubject={() => setAddSubjectOpen(true)} isModalOpen={addSubjectOpen} stats={stats} onNavigateTopic={(t) => { setFocusTopicId(t.id); setView('temas'); }} showToast={showToast} />}
                {view === 'temas'       && <Temas       topics={topics} subjects={subjects} onMark={setModalTopic} onEditTopic={setEditTopic} onEditSubject={setEditSubject} focusAsig={focusAsig} focusTopicId={focusTopicId} />}
                {view === 'asignaturas' && <Asignaturas subjects={subjects} topics={topics} onEditSubject={setEditSubject} onAddSubject={() => setAddSubjectOpen(true)} />}
                {view === 'stats'       && <Stats       stats={stats} onAddSubject={() => setAddSubjectOpen(true)} onGoToTemas={() => setView('temas')} />}
                {view === 'calendario' && <Calendario topics={topics} subjects={subjects} exams={exams} onAddExam={openAddExam} onDeleteExam={handleDeleteExam} onNavigateTopic={(t) => { setFocusTopicId(t.id); setView('temas'); }} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AppModals
        modalTopic={modalTopic}
        onCloseDoneModal={() => setModalTopic(null)}
        onConfirmDone={handleConfirmDone}
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
