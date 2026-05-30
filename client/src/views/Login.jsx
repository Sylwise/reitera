import { useMemo } from "react";
import { motion } from "framer-motion";
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

export default function Login({ onLogin }) {
  const cells = useMemo(() => generateHeatmap(), []);

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
            Bienvenido
            <br />
            de nuevo
          </h1>
          <p className="lg-subheading">// continúa donde lo dejaste</p>

          <button className="lg-oauth-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuar con Google
          </button>

          <button className="lg-oauth-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Continuar con GitHub
          </button>

          <div className="lg-divider">
            <div className="lg-divider-line" />
            <span className="lg-divider-text">o</span>
            <div className="lg-divider-line" />
          </div>

          <div className="lg-field">
            <label>EMAIL</label>
            <input
              type="email"
              placeholder="tu@universidad.edu"
              autoComplete="email"
            />
          </div>

          <div className="lg-field">
            <div className="lg-field-row">
              <label>CONTRASEÑA</label>
              <a href="#" className="lg-forgot">
                He olvidado mi contraseña
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••••••"
              autoComplete="current-password"
            />
          </div>

          <button className="lg-btn-primary" onClick={onLogin}>
            Entrar con Email
          </button>

          <p className="lg-signup">
            ¿No tienes cuenta? <a href="#">Regístrate gratis</a>
          </p>
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
              <span className="lg-stat-label">Días de racha</span>
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
