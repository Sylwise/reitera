import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { login, register } from "../api/auth";
import "./Login.css";

const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN"];

function generateHeatmap() {
  const total = 26 * 7;
  return Array.from({ length: total }, (_, i) => {
    const progress = i / total;
    const raw = Math.random() * 0.4 + progress * 0.6;
    if (Math.random() < 0.12) return 0.04;
    if (raw < 0.15) return 0.04;
    if (raw < 0.3) return 0.12;
    if (raw < 0.5) return 0.28;
    if (raw < 0.7) return 0.55;
    return 0.85;
  });
}

export default function Login({ onLogin, notice }) {
  const cells = useMemo(() => generateHeatmap(), []);
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        await register({ name, email, password });
      }
      await login({ email, password });
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div 
      className="lg-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Left: form ── */}
      <div className="lg-left">
        <div className="lg-logo">
          <span className="lg-logo-dot" />
          REITERA
        </div>

        <motion.div 
          className="lg-form-area"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, type: 'spring', damping: 25 }}
        >
          <h1 className="lg-heading">
            {mode === "login" ? (
              <>Inicia sesión</>
            ) : (
              <>Crea tu<br />cuenta</>
            )}
          </h1>
          <p className="lg-subheading">
            {mode === "login" ? "// continúa donde lo dejaste" : "// empieza a llevar el control"}
          </p>

          {notice && <p className="lg-notice">{notice}</p>}

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="lg-field">
                <label htmlFor="lg-name">NOMBRE</label>
                <input
                  id="lg-name"
                  type="text"
                  placeholder="Tu nombre"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="lg-field">
              <label htmlFor="lg-email">EMAIL</label>
              <input
                id="lg-email"
                type="email"
                placeholder="tu@universidad.edu"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="lg-field">
              <label htmlFor="lg-password">CONTRASEÑA</label>
              <input
                id="lg-password"
                type="password"
                placeholder="••••••••••"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="lg-error">{error}</p>}

            <button className="lg-btn-primary" type="submit" disabled={loading}>
              {loading
                ? "Un momento…"
                : mode === "login"
                ? "Entrar"
                : "Crear cuenta"}
            </button>
          </form>

          <p className="lg-signup">
            {mode === "login" ? (
              <>
                ¿No tienes cuenta?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); setError(null); setMode("register"); }}>
                  Regístrate gratis
                </a>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); setError(null); setMode("login"); }}>
                  Inicia sesión
                </a>
              </>
            )}
          </p>

          {mode === "login" && (
            <p className="lg-help">
              ¿Olvidaste la contraseña?{" "}
              <a href="mailto:reitera@duck.com">Escríbeme</a>
            </p>
          )}
        </motion.div>
      </div>

      {/* ── Right: visual ── */}
      <div className="lg-right">
        <motion.div 
          className="lg-heatmap-wrapper"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: 'spring', damping: 30 }}
        >
          <div className="lg-heatmap-header">
            <span className="lg-heatmap-title">ACTIVIDAD DE REPASO</span>
            <span className="lg-heatmap-stat">↑ 12% este mes</span>
          </div>

          <div className="lg-heatmap-grid">
            {cells.map((intensity, i) => (
              <div
                key={i}
                className="lg-hm-cell"
                style={{ "--intensity": intensity }}
              />
            ))}
          </div>

          <div className="lg-heatmap-months">
            {MONTHS.map((m) => (
              <span key={m} className="lg-month-label">
                {m}
              </span>
            ))}
          </div>

          <div className="lg-stats-row">
            <div className="lg-stat-pill">
              <span className="lg-stat-num">47</span>
              <span className="lg-stat-label">Temas afianzados</span>
            </div>
            <div className="lg-stat-pill">
              <span className="lg-stat-num">1.2k</span>
              <span className="lg-stat-label">Repasos totales</span>
            </div>
            <div className="lg-stat-pill">
              <span className="lg-stat-num">94%</span>
              <span className="lg-stat-label">Tasa de acierto</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="lg-quote"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p>
            Tus exámenes bajo control.
            <br />
            <em>Deja de olvidar</em> lo que estudias.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
