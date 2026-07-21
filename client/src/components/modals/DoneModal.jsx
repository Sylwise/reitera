import { useState, useEffect, useRef } from "react";
import ModalShell from "../ui/ModalShell";

export default function DoneModal({ topic, isOpen, onClose, onConfirm }) {
  const keyHandlerRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => keyHandlerRef.current?.(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <DoneForm
        key={topic?.id}
        keyHandlerRef={keyHandlerRef}
        topic={topic}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </ModalShell>
  );
}

function DoneForm({ keyHandlerRef, topic, onClose, onConfirm }) {
  const [diff, setDiff] = useState("normal");
  const [score, setScore] = useState("");
  const [showScore, setShowScore] = useState(false);

  function validateScore(s) {
    if (!s.trim()) return null;
    const str = s.trim();

    if (!/^\d+$/.test(str)) return "Debe ser un número entero";
    const num = parseInt(str, 10);
    if (num < 1 || num > 10) return "Debe estar entre 1 y 10";
    return null;
  }

  const scoreError = validateScore(score);
  const canConfirm = !scoreError;

  useEffect(() => {
    keyHandlerRef.current = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.key === "Enter" && canConfirm) {
        onConfirm({ dificultad: diff, score: score.trim() });
        onClose();
      }
      if (e.key === "1") setDiff("easy");
      if (e.key === "2") setDiff("normal");
      if (e.key === "3") setDiff("hard");
      if (e.key === "4") setDiff("again");
      if (e.key === "Escape") onClose();
    };
  });

  return (
    <>
      <button className="btn-cancel" onClick={onClose}>
        ✕
      </button>
      <div className="modal-asig">{topic?.asig}</div>
      <div className="modal-title">{topic?.name}</div>
      <div className="modal-sub">¿Cómo fue este repaso?</div>
      <div className="modal-divider" />

      <div
        className="modal-section-label"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Dificultad</span>
        <span
          className="key-hint"
          style={{
            color: "var(--muted)",
            fontSize: ".66rem",
            letterSpacing: ".04em",
          }}
        >
          teclas 1 · 2 · 3 · 4
        </span>
      </div>
      <div className="diff-btns">
        {[
          { key: "easy", label: "Fácil" },
          { key: "normal", label: "Normal" },
          { key: "hard", label: "Difícil" },
          { key: "again", label: "Otra vez" },
        ].map((b, i) => (
          <button
            key={b.key}
            className={`diff-btn ${b.key}${diff === b.key ? " selected" : ""}`}
            onClick={() => setDiff(b.key)}
          >
            <span className="kbd-hint">{i + 1}</span>
            {b.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowScore((v) => !v)}
        style={{
          background: "none",
          border: "none",
          color: "var(--muted)",
          fontFamily: "var(--sans)",
          fontSize: ".75rem",
          cursor: "pointer",
          padding: "0 0 .75rem",
          display: "flex",
          alignItems: "center",
          gap: ".35rem",
          transition: "color .15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
      >
        <span style={{ fontSize: ".7rem" }}>{showScore ? "▾" : "▸"}</span>{" "}
        Añadir puntuación (opcional)
      </button>

      {showScore && (
        <div style={{ marginBottom: ".5rem" }}>
          <input
            className="modal-input"
            style={{
              borderColor:
                scoreError && score ? "var(--danger)" : "var(--border)",
            }}
            type="number"
            min={1}
            max={10}
            placeholder="ej. 7 (1-10)"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            autoFocus
          />
          {scoreError && score && (
            <div
              style={{
                color: "var(--danger)",
                fontSize: ".7rem",
                marginTop: ".3rem",
              }}
            >
              {scoreError}
            </div>
          )}
        </div>
      )}

      <button
        className="btn-confirm"
        disabled={!canConfirm}
        style={{ marginTop: showScore ? 0 : ".5rem" }}
        onClick={() => {
          if (canConfirm) {
            onConfirm({ dificultad: diff, score: score.trim() });
            onClose();
          }
        }}
      >
        ✓ Confirmar repaso
        <span className="key-hint" style={{ opacity: 0.5, fontSize: ".7rem", marginLeft: ".5rem" }}>
          Enter ↵
        </span>
      </button>
    </>
  );
}
