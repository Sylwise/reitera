import { useState, useEffect, useMemo } from 'react';
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
import { applyExamCaps } from './utils/topicHelpers';
import { getToken, getUser, setUnauthorizedHandler } from './api/client';
import { deleteAccount, changePassword, logout } from './api/auth';

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
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [sessionExpired, setSessionExpired]       = useState(false);

  const { toast, showToast, dismissToast } = useToast();
  const {
    topics, setTopics,
    modalTopic, setModalTopic,
    handleConfirm, handleConfigTopic, handleEditTopic, handleDeleteTopic, handleResetTopic,
    isLoading: topicsLoading,
    error: topicsError,
    refetch: refetchTopics,
  } = useTopics(showToast);
  const {
    subjects,
    handleAddSubject, handleEditSubject, handleDeleteSubject,
    isLoading: subjectsLoading,
    error: subjectsError,
    refetch: refetchSubjects,
  } = useSubjects(setTopics, setFocusAsig, showToast);
  const {
    exams,
    addExamOpen, setAddExamOpen,
    addExamDate,
    handleAddExam, handleDeleteExam, openAddExam,
    isLoading: examsLoading,
    error: examsError,
    refetch: refetchExams,
  } = useExams(showToast);
  const {
    stats: backendStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useStats();

  useEffect(() => { localStorage.setItem('repaso_view', view); }, [view]);

  // Un 401 en cualquier petición (token caducado) fuerza el logout con aviso,
  // en vez de dejar la app "logueada" enseñando el estado vacío.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setCurrentUser(null);
      setLoggedIn(false);
      setSessionExpired(true);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

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

  async function handleChangePassword(payload) {
    await changePassword(payload);
    showToast('✓ Contraseña actualizada');
  }

  function handleLoginSuccess() {
    setCurrentUser(getUser());
    setLoggedIn(true);
    setSessionExpired(false);
    setView('dashboard');
    refetchTopics();
    refetchSubjects();
    refetchExams();
    refetchStats();
  }

  // Si los exámenes fallan, los temas siguen siendo utilizables: se pierde el tope
  // por examen, no la vista entera. Van antes del return de Login porque son hooks.
  const adjustedTopics = useMemo(
    () => (topics ? (exams ? applyExamCaps(topics, exams) : topics) : null),
    [topics, exams],
  );
  const statsReady = backendStats && adjustedTopics && subjects;
  // Memoizado porque baja como prop a componentes que a su vez memoizan sobre él:
  // reconstruir el objeto en cada render invalidaba esos useMemo siempre.
  const stats = useMemo(
    () => (statsReady ? { ...backendStats, ...buildRealStats(adjustedTopics, subjects) } : null),
    [statsReady, backendStats, adjustedTopics, subjects],
  );

  if (!loggedIn) {
    return (
      <Login
        onLogin={handleLoginSuccess}
        notice={sessionExpired ? 'Tu sesión ha caducado. Vuelve a iniciar sesión.' : null}
      />
    );
  }

  // Cada bloque de datos expone su propio estado; no hay carga ni error globales.
  const coreState = {
    isLoading: topicsLoading || subjectsLoading,
    error: topicsError || subjectsError,
    retry: () => { refetchTopics(); refetchSubjects(); },
  };
  const subjectsState = {
    isLoading: subjectsLoading,
    error: subjectsError,
    retry: refetchSubjects,
  };
  // Los exámenes entran en la carga (las gráficas se calculan con el tope aplicado, y sin
  // esperarlos las cifras bailarían al llegar) pero no en el error: si fallan, se pierde el
  // tope y nada más.
  const statsState = {
    isLoading: statsLoading || topicsLoading || subjectsLoading || examsLoading,
    error: statsError || topicsError || subjectsError,
    retry: () => { refetchStats(); refetchTopics(); refetchSubjects(); },
  };
  const calendarState = {
    isLoading: topicsLoading || subjectsLoading || examsLoading,
    error: topicsError || subjectsError || examsError,
    retry: () => { refetchTopics(); refetchSubjects(); refetchExams(); },
  };

  return (
    <>
      <div className="app-shell">
        <Sidebar
          view={view}
          onViewChange={(v) => { setView(v); setFocusAsig(null); setFocusTopicId(null); }}
          onSelectSubject={(asig) => { setFocusAsig(prev => prev === asig ? null : asig); setFocusTopicId(null); setView('temas'); }}
          onEditSubject={setEditSubject}
          subjects={subjects}
          topics={adjustedTopics}
          subjectsState={subjectsState}
          userName={currentUser?.name}
          onAddSubject={() => setAddSubjectOpen(true)}
          onLogout={handleLogout}
          onChangePassword={() => setChangePasswordOpen(true)}
          onDeleteAccount={() => setDeleteAccountOpen(true)}
        />

        <div className="main-area">
          <Topbar
            topics={adjustedTopics}
            subjects={subjects}
            userName={currentUser?.name}
            onAddTopic={() => openConfigModal(null)}
            onOpenAsignaturas={() => setView('asignaturas')}
            onLogout={handleLogout}
            onChangePassword={() => setChangePasswordOpen(true)}
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
                {view === 'dashboard'  && <Dashboard  topics={adjustedTopics} subjects={subjects} onMark={setModalTopic} onEditTopic={setEditTopic} onAddSubject={() => setAddSubjectOpen(true)} isModalOpen={addSubjectOpen} stats={stats} onNavigateTopic={(t) => { setFocusTopicId(t.id); setView('temas'); }} showToast={showToast} coreState={coreState} statsState={statsState} />}
                {view === 'temas'       && <Temas       topics={adjustedTopics} subjects={subjects} onMark={setModalTopic} onEditTopic={setEditTopic} onEditSubject={setEditSubject} onAddTopic={() => openConfigModal(null)} focusAsig={focusAsig} focusTopicId={focusTopicId} coreState={coreState} />}
                {view === 'asignaturas' && <Asignaturas subjects={subjects} topics={adjustedTopics} onEditSubject={setEditSubject} onAddSubject={() => setAddSubjectOpen(true)} subjectsState={subjectsState} />}
                {view === 'stats'       && <Stats       stats={stats} onAddSubject={() => setAddSubjectOpen(true)} onGoToTemas={() => setView('temas')} statsState={statsState} />}
                {view === 'calendario' && <Calendario topics={adjustedTopics} subjects={subjects} exams={exams} onAddExam={openAddExam} onDeleteExam={handleDeleteExam} onNavigateTopic={(t) => { setFocusTopicId(t.id); setView('temas'); }} calendarState={calendarState} />}
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
        subjects={subjects ?? []}
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
        changePasswordOpen={changePasswordOpen}
        onCloseChangePassword={() => setChangePasswordOpen(false)}
        onConfirmChangePassword={handleChangePassword}
        toast={toast}
        onDismissToast={dismissToast}
      />
    </>
  );
}
