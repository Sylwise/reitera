import { useState, useEffect, useRef } from "react";
import ModalShell from "../ui/ModalShell";

export default function ConfigTopicModal({
  isOpen,
  onClose,
  onConfirm,
  subjects,
  initialAsig,
}) {
  const keyHandlerRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => keyHandlerRef.current?.(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <ConfigTopicForm
        key={initialAsig ?? "none"}
        keyHandlerRef={keyHandlerRef}
        onClose={onClose}
        onConfirm={onConfirm}
        subjects={subjects}
        initialAsig={initialAsig}
      />
    </ModalShell>
  );
}

function ConfigTopicForm({ keyHandlerRef, onClose, onConfirm, subjects, initialAsig }) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    initialAsig ?? subjects[0]?.id ?? null
  );
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canConfirm = name.trim().length >= 3 && selectedSubjectId;

  // El modal se queda abierto con el botón bloqueado hasta que el POST resuelve,
  // para que un doble clic no cree el tema dos veces.
  async function handleConfirm() {
    if (!canConfirm || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm({ subjectId: selectedSubjectId, name: name.trim() });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    keyHandlerRef.current = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.repeat || e.target.tagName === "BUTTON")) return;
      if (e.key === "Enter") handleConfirm();
    };
  });

  return (
    <>
      <button className="btn-cancel" onClick={onClose}>
        ✕
      </button>
      <div className="modal-asig" style={{ color: "var(--muted)" }}>
        NUEVO TEMA
      </div>
      <div className="modal-title">Añadir tema</div>
      <div className="modal-divider" />

      <div className="modal-section-label">Asignatura</div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: ".4rem",
          marginBottom: "1.5rem",
        }}
      >
        {subjects.map((s) => (
          <button
            key={s.id}
            className={`filter-btn${selectedSubjectId === s.id ? " active" : ""}`}
            style={
              selectedSubjectId === s.id
                ? {
                    background: `color-mix(in srgb, ${s.color} 12%, transparent)`,
                    borderColor: s.color,
                    color: s.color,
                  }
                : {}
            }
            onClick={() => setSelectedSubjectId(s.id)}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: s.color,
                marginRight: 5,
                verticalAlign: "middle",
                marginTop: -1,
              }}
            />
            {s.name}
          </button>
        ))}
      </div>

      <div className="modal-section-label">Nombre del tema</div>
      <input
        className="modal-input"
        type="text"
        placeholder="ej. Introducción a SQL"
        value={name}
        onChange={(e) => setName(e.target.value)}
        minLength={3}
        maxLength={100}
      />

      {error && (
        <div className="modal-section-label" style={{ color: "var(--danger)", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <button
        className="btn-confirm"
        disabled={!canConfirm || submitting}
        onClick={handleConfirm}
      >
        {submitting ? 'Creando…' : 'Confirmar tema'}
        {!submitting && (
          <span className="key-hint" style={{ opacity: 0.5, fontSize: ".7rem", marginLeft: ".5rem" }}>
            Enter ↵
          </span>
        )}
      </button>
    </>
  );
}
