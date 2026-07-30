// toLocaleDateString devuelve el mes y el día de la semana en minúscula y, según el
// locale, con punto final ("sáb.", "ago."). Estas tres envolturas estaban copiadas en
// Stats, Topbar y el timeline.

export function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function shortMonth(date) {
  return date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
}

export function shortWeekday(date) {
  return date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
}

export function longDate(date) {
  return capitalize(date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));
}
