import { motion, AnimatePresence } from 'framer-motion';
import DoneModal        from './DoneModal';
import AddSubjectModal  from './AddSubjectModal';
import AddExamModal     from './AddExamModal';
import ConfigTopicModal from './ConfigTopicModal';
import EditSubjectModal from './EditSubjectModal';
import EditTopicModal   from './EditTopicModal';

export default function AppModals({
  // DoneModal
  modalTopic, onCloseDoneModal, onConfirmDone,
  // AddSubjectModal
  addSubjectOpen, onCloseAddSubject, onAddSubject,
  // AddExamModal
  addExamOpen, onCloseAddExam, onAddExam, subjects, addExamDate,
  // ConfigTopicModal
  configOpen, onCloseConfig, onConfirmConfig, topics, configInitAsig,
  // EditSubjectModal
  editSubject, onCloseEditSubject, onEditSubject, onDeleteSubject,
  // EditTopicModal
  editTopic, onCloseEditTopic, onEditTopic, onDeleteTopic, onResetTopic,
  // Toast
  toast, onDismissToast,
}) {
  return (
    <>
      <DoneModal
        topic={modalTopic}
        isOpen={!!modalTopic}
        onClose={onCloseDoneModal}
        onConfirm={onConfirmDone}
      />
      <AddSubjectModal
        isOpen={addSubjectOpen}
        onClose={onCloseAddSubject}
        onAdd={onAddSubject}
      />
      <AddExamModal
        isOpen={addExamOpen}
        onClose={onCloseAddExam}
        onAdd={onAddExam}
        subjects={subjects}
        initialDate={addExamDate}
      />
      <ConfigTopicModal
        isOpen={configOpen}
        onClose={onCloseConfig}
        onConfirm={onConfirmConfig}
        subjects={subjects}
        topics={topics}
        initialAsig={configInitAsig}
      />
      <EditSubjectModal
        isOpen={!!editSubject}
        onClose={onCloseEditSubject}
        onEdit={onEditSubject}
        onDelete={onDeleteSubject}
        subject={editSubject != null ? subjects.find(s => s.id === editSubject) : null}
      />
      <EditTopicModal
        isOpen={!!editTopic}
        onClose={onCloseEditTopic}
        onEdit={onEditTopic}
        onDelete={onDeleteTopic}
        onReset={onResetTopic}
        topic={editTopic}
      />

      <AnimatePresence>
        {toast && (
          <div className="toast-container">
            <motion.div
              className="toast-notification"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, { offset, velocity }) => {
                if (Math.abs(offset.x) > 80 || Math.abs(velocity.x) > 500) {
                  onDismissToast();
                }
              }}
              style={{ pointerEvents: 'all', cursor: 'grab', touchAction: 'pan-y' }}
              whileDrag={{ cursor: 'grabbing' }}
            >
              {toast}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
