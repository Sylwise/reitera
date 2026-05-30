export default function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--muted)' }}>
      <span style={{ animation: 'pulse 1.2s ease-in-out infinite' }}>Cargando...</span>
    </div>
  );
}
