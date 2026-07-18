import { useState, useEffect, useRef } from "react";
import ModalShell from "../ui/ModalShell";

const TOTAL_OPTS = [2, 3, 4, 5, 6];

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
  const [reviewsNeeded, setReviewsNeeded] = useState(4);

  function handleConfirm() {
    if (!name.trim() || !selectedSubjectId) return;
    onConfirm({ subjectId: selectedSubjectId, name: name.trim(), reviewsNeeded });
    onClose();
  }

  useEffect(() => {
    keyHandlerRef.current = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && name.trim() && selectedSubjectId) handleConfirm();
    };
  });

  const canConfirm = name.trim().length >= 3 && selectedSubjectId;

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
      <div className="modal-section-label" style={{ marginTop: '1.5rem' }}>Repasos necesarios</div>
      <div style={{ display: "flex", gap: ".4rem", marginBottom: "1.5rem" }}>
        {TOTAL_OPTS.map((n) => (
          <button
            key={n}
            className={`diff-btn normal${reviewsNeeded === n ? " selected" : ""}`}
            style={{
              flex: 1,
              ...(reviewsNeeded === n
                ? {
                    background: "rgba(200,251,78,.1)",
                    borderColor: "var(--accent)",
                    color: "var(--accent)",
                  }
                : {}),
            }}
            onClick={() => setReviewsNeeded(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <button
        className="btn-confirm"
        disabled={!canConfirm}
        onClick={handleConfirm}
      >
        Confirmar tema
        <span style={{ opacity: 0.5, fontSize: ".7rem", marginLeft: ".5rem" }}>
          Enter ↵
        </span>
      </button>
    </>
  );
}
