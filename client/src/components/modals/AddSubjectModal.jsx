import { useState, useEffect, useRef } from "react";
import ModalShell from "../ui/ModalShell";
import { PALETTE, SUBJECT_LIMIT } from "../../data/subjects";

export default function AddSubjectModal({ isOpen, onClose, onAdd, subjectCount = 0 }) {
  const keyHandlerRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => keyHandlerRef.current?.(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <AddSubjectForm keyHandlerRef={keyHandlerRef} onClose={onClose} onAdd={onAdd} subjectCount={subjectCount} />
    </ModalShell>
  );
}

function AddSubjectForm({ keyHandlerRef, onClose, onAdd, subjectCount }) {
  const [name, setName] = useState("");
  const [totalTopics, setTotalTopics] = useState(6);
  const [color, setColor] = useState(PALETTE[0]);
  const atLimit = subjectCount >= SUBJECT_LIMIT;

  useEffect(() => {
    keyHandlerRef.current = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && name.trim() && !atLimit) handleAdd();
    };
  });

  function handleAdd() {
    if (name.trim().length < 3 || atLimit) return;
    onAdd({ name: name.trim(), totalTopics: Math.max(1, totalTopics), color });
    onClose();
  }

  return (
    <>
      <button className="btn-cancel" onClick={onClose}>
        ✕
      </button>

      <div className="modal-asig" style={{ color: "var(--muted)" }}>
        NUEVA ASIGNATURA
      </div>
      <div className="modal-title" style={{ paddingBottom: "0.15em" }}>
        Añadir asignatura
      </div>
      <div className="modal-divider" />

      {atLimit && (
        <div
          className="modal-section-label"
          style={{ color: "var(--danger)", marginBottom: "1rem" }}
        >
          Has alcanzado el máximo de {SUBJECT_LIMIT} asignaturas.
        </div>
      )}

      <div className="modal-section-label">Nombre</div>
      <input
        className="modal-input"
        type="text"
        minLength={3}
        maxLength={40}
        placeholder="ej. Programación"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={atLimit}
        autoFocus
      />

      <div className="modal-section-label">Temas totales del curso</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: ".5rem",
          marginBottom: "1.5rem",
        }}
      >
        <button
          className="stepper-btn"
          onClick={() => setTotalTopics((t) => Math.max(1, t - 1))}
        >
          −
        </button>
        <input
          className="stepper-input"
          type="number"
          min={1}
          max={15}
          value={totalTopics}
          onChange={(e) =>
            setTotalTopics(Math.max(1, parseInt(e.target.value) || 1))
          }
        />
        <button
          className="stepper-btn"
          onClick={() => setTotalTopics((t) => Math.min(15, t + 1))}
        >
          +
        </button>
      </div>

      <div className="modal-section-label">Color</div>
      <div className="color-picker">
        {PALETTE.map((c) => (
          <button
            key={c}
            className={`color-swatch${color === c ? " selected" : ""}`}
            style={{
              "--swatch-color": c,
              background: c,
              borderColor: color === c ? "#fff" : "transparent",
              boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
            }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>

      <button
        className="btn-confirm"
        disabled={name.trim().length < 3 || atLimit}
        onClick={handleAdd}
      >
        Crear asignatura
        <span style={{ opacity: 0.5, fontSize: ".7rem", marginLeft: ".5rem" }}>
          Enter ↵
        </span>
      </button>
    </>
  );
}
