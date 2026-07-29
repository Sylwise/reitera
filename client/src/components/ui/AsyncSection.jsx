import '../../views/EmptyState.css';

// Tres estados explícitos para cada bloque de datos: mientras carga se pinta el
// esqueleto, si falla se ofrece reintentar, y sólo con la carga resuelta se deja
// pasar al hijo (que es quien decide si mostrar su estado vacío).
// El error se comprueba antes que la carga: si una sección agrega varias fuentes,
// una que siga en vuelo no debe tapar el fallo de otra ni dejar el esqueleto eterno.
export default function AsyncSection({ isLoading, error, onRetry, skeleton, children }) {
  if (error) {
    return (
      <div className="section-error" role="alert">
        <div className="section-error-msg">
          No se han podido cargar estos datos.
          <br />
          ({error})
        </div>
        {onRetry && (
          <button className="section-error-retry" onClick={onRetry} type="button">
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (isLoading) return skeleton ?? null;

  return <>{children}</>;
}
