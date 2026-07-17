// Puntero "coarse" = táctil: evita autofocus que abre el teclado al montar modales.
export const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
