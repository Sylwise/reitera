import { useEffect, useMemo, useRef, useState } from 'react';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { capitalize, longDate, shortMonth, shortWeekday } from '../../utils/dateHelpers';

const H           = 100;
const LINE_Y      = 48;
const PAD         = 18;
const LABEL_ABOVE = 32;
const LABEL_BELOW = 72;
const CHAR_W      = 5.4;  // ancho aproximado por carácter a 9px en Fira Code, para detectar solapes
const MIN_R_COUNT = 6.5;  // por debajo de este radio el número no cabe dentro del punto
// 24px es el diámetro del marcador más grande que dibujamos (el cluster, 13 de radio
// contando su anillo): por debajo de esa separación dos hitos no caben uno al lado del
// otro sin tocarse, así que es el punto exacto donde fusionar deja de ser opcional.
const CLUSTER_PX  = 24;
const RING_GAP    = 3;    // grosor del hueco entre el punto y su anillo, en los clusters
const TIP_MAX     = 240;  // debe coincidir con el max-width de .timeline-tip
// Por debajo de este ancho no caben 30 días con holgura (quedarían menos de ~12px por
// día). La ventana se decide por el ancho REAL del panel y no por el viewport porque
// entre 769px y ~1080px la tarjeta es media columna y queda MÁS estrecha que a pantalla
// completa en móvil, donde ocupa el ancho entero.
const NARROW_PX   = 420;
// Un cluster puede acumular muchos temas y el tooltip crecía hasta tapar la tarjeta de
// abajo. Se recorta la lista y se indica cuántos quedan.
const TIP_TOPICS  = 4;

function dateFor(offset) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

function dayLabel(date) {
  return `${capitalize(shortWeekday(date))} ${date.getDate()}`;
}

function rangeLabel(from, to) {
  return shortMonth(from) === shortMonth(to)
    ? `${from.getDate()}-${to.getDate()} ${shortMonth(to)}`
    : `${from.getDate()} ${shortMonth(from)}-${to.getDate()} ${shortMonth(to)}`;
}

export default function UpcomingLoadTimeline({ milestones = [], onWindowChange }) {
  const wrapRef   = useRef(null);
  const canvasRef = useRef(null);
  const [width, setWidth]   = useState(0);
  // Se guarda el offset del primer día del hito, no su índice: los hitos se
  // recalculan al cambiar el ancho o la ventana y un índice acabaría señalando a otro.
  const [activeKey, setActiveKey] = useState(null);

  // El ratón cierra el tooltip con pointerleave, pero el dedo no tiene equivalente:
  // sin esto, en táctil se quedaba abierto hasta volver a tocar el mismo marcador.
  useOutsideClick(canvasRef, () => setActiveKey(null), activeKey !== null);

  // El SVG se dibuja en píxeles reales (viewBox = ancho medido) en vez de escalar un
  // viewBox fijo: así el texto no encoge en pantallas estrechas y se puede decidir
  // qué etiquetas caben sin solaparse.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const days    = width > 0 && width < NARROW_PX ? 15 : 30;
  // milestones siempre trae MAX_LOAD_WINDOW_DAYS; aquí se recorta a la ventana elegida.
  const visible = useMemo(() => milestones.filter(m => m.offset < days), [milestones, days]);
  const total   = visible.reduce((s, m) => s + m.count, 0);
  const inner   = Math.max(0, width - PAD * 2);

  // El título de la tarjeta lo pinta el Panel de fuera, así que tiene que enterarse
  // de la ventana que hemos elegido o diría un número distinto al del eje.
  useEffect(() => {
    if (width > 0) onWindowChange?.(days);
  }, [width, days, onWindowChange]);

  const items = useMemo(() => {
    if (!width) return [];

    // Escala lineal: el eje tiene que poder leerse como tiempo real, o sea que la
    // misma distancia en pantalla debe significar los mismos días en cualquier punto
    // de la ventana. La acumulación de hitos próximos entre sí se resuelve
    // fusionándolos (ver clustering abajo), no deformando el eje.
    const xFor = offset => PAD + inner * (offset / days);

    // 1. Posición de cada día y fusión de los que quedan demasiado juntos. La
    //    comparación es contra el PRIMER día del cluster, no contra el anterior: si
    //    se encadenara, con escala lineal (15.7px/día en escritorio, por debajo del
    //    umbral) una racha de días seguidos se tragaría media ventana en un solo
    //    punto. Así un cluster nunca abarca más de CLUSTER_PX de ancho.
    const groups = [];
    let current = null;
    visible.forEach(m => {
      const x = xFor(m.offset);
      if (current && x - current.startX < CLUSTER_PX) {
        current.entries.push({ ...m, x });
      } else {
        current = { entries: [{ ...m, x }], startX: x };
        groups.push(current);
      }
    });

    const base = groups.map(g => {
      const isCluster = g.entries.length > 1;
      const last      = g.entries[g.entries.length - 1];
      const px        = g.entries.reduce((s, d) => s + d.x, 0) / g.entries.length;
      const hasToday  = g.entries.some(d => d.offset === 0);
      const count     = g.entries.reduce((s, d) => s + d.count, 0);
      const from      = dateFor(g.entries[0].offset);
      const to        = dateFor(last.offset);
      const text      = isCluster ? rangeLabel(from, to) : hasToday ? 'Hoy' : dayLabel(from);
      return {
        key: g.entries[0].offset, px, lastX: last.x,
        isCluster, hasToday, count, from, to, text, entries: g.entries,
      };
    });

    // 2. Etiquetas y radios, ya sobre los hitos definitivos.
    // El "+Nd" del extremo vive en el carril de abajo y es fijo: hay que reservarle
    // su sitio o un hito del final de la ventana se le monta encima.
    const endLabelLeft = PAD + inner - `+${days}d`.length * CHAR_W;
    const lastRight = { above: -Infinity, below: -Infinity };
    return base.map((it, i) => {
      const half = (it.text.length * CHAR_W) / 2;
      // Alternar arriba/abajo no basta con hitos seguidos: se descarta la etiqueta
      // que pisaría a la anterior de su mismo lado. La de hoy nunca se descarta.
      const wanted = i % 2 === 0 ? 'below' : 'above';
      const side   = wanted === 'below' && it.px + half > endLabelLeft - 6 ? 'above' : wanted;
      const fits   = it.px - half > lastRight[side] + 6;
      const label  = it.hasToday || fits;
      if (label) lastRight[side] = it.px + half;
      // La etiqueta va centrada en su hito salvo en los extremos, donde se desplaza
      // lo justo para no salirse del SVG (que recorta lo que sobresale).
      const labelX = Math.min(Math.max(it.px, half + 2), width - half - 2);

      // El radio se limita por la distancia al vecino MÁS CERCANO, no por un tope
      // global: un hito aislado conserva su tamaño y solo encogen los apretados.
      const gap = Math.min(
        i > 0 ? it.px - base[i - 1].px : Infinity,
        i < base.length - 1 ? base[i + 1].px - it.px : Infinity,
      );
      const idealOuter = it.isCluster ? 13 : it.hasToday ? 11 : it.count > 1 ? 9 : 4;
      const outer      = Math.min(idealOuter, Math.max(3, gap / 2 - 0.75));
      // El anillo se dibuja EN outer y el punto por dentro, no al revés: así el hito
      // nunca ocupa más de lo que se le ha presupuestado, por apretado que esté.
      const r          = it.isCluster ? Math.max(2, outer - RING_GAP) : outer;
      // El área táctil no puede pasar de la mitad de la distancia al vecino o se
      // solaparían y unos píxeles activarían el hito de al lado.
      const hit        = Math.min(16, Math.max(outer, gap / 2));
      return { ...it, side, label, labelX, r, outer, hit };
    });
  }, [visible, width, inner, days]);

  // El tramo verde llega hasta el ÚLTIMO día con carga, no hasta el centro del último
  // hito, que en un cluster cae antes de su propio final.
  const lastX = items.length ? items[items.length - 1].lastX : PAD;
  const endX  = PAD + inner;
  const tip   = items.find(it => it.key === activeKey) ?? null;

  const summary = total === 0
    ? `Sin repasos programados en los próximos ${days} días.`
    : `Carga de repasos en los próximos ${days} días: ${total} repaso${total === 1 ? '' : 's'} repartido${total === 1 ? '' : 's'} en ${visible.length} día${visible.length === 1 ? '' : 's'}.`;

  // El aria-label sí lista todo: el recorte es para que el tooltip no crezca en pantalla.
  const tipRows = useMemo(() => {
    if (!tip) return null;
    let left = TIP_TOPICS, hidden = 0;
    const rows = [];
    for (const d of tip.entries) {
      const take = Math.min(left, d.topics.length);
      hidden += d.topics.length - take;
      if (take > 0) rows.push({ offset: d.offset, topics: d.topics.slice(0, take) });
      left -= take;
    }
    return { rows, hidden };
  }, [tip]);

  const describe = it =>
    `${it.text}, ${it.count} repaso${it.count === 1 ? '' : 's'}: ` +
    it.entries.flatMap(d => d.topics.map(t => t.name)).join(', ');

  return (
    <div className="timeline-wrap" ref={wrapRef}>
      {total > 0 && (
        <div className="timeline-sub">{total} repaso{total === 1 ? '' : 's'} programado{total === 1 ? '' : 's'}</div>
      )}

      <div className="timeline-canvas" style={{ height: H }} ref={canvasRef}>
        {width > 0 && (
          <svg
            width="100%"
            height={H}
            viewBox={`0 0 ${width} ${H}`}
            // role="group" y no "img": img volvería presentacional todo el subárbol y
            // dejaría los marcadores, que son focusables, invisibles para el lector.
            role="group"
            // Tocar el hueco del propio gráfico también cierra; el marcador no, porque
            // su handler ya ha corrido y aquí el target sigue estando dentro de él.
            onPointerDown={e => { if (!e.target.closest('.tl-point')) setActiveKey(null); }}
          >
            <title>{summary}</title>

            {total === 0 ? (
              <>
                <line x1={PAD} y1={LINE_Y} x2={endX} y2={LINE_Y} className="tl-line-rest" />
                <text x={width / 2} y={LABEL_BELOW} textAnchor="middle" className="tl-label">
                  Sin repasos en los próximos {days} días
                </text>
              </>
            ) : (
              <>
                <line x1={PAD} y1={LINE_Y} x2={lastX} y2={LINE_Y} className="tl-line-active" />
                <line x1={lastX} y1={LINE_Y} x2={endX} y2={LINE_Y} className="tl-line-rest" />
                <circle cx={endX} cy={LINE_Y} r={2.5} className="tl-end-dot" />
                <text x={endX} y={LABEL_BELOW} textAnchor="end" className="tl-label">+{days}d</text>

                {items.map(it => (
                  <g
                    key={it.key}
                    className="tl-point"
                    role="button"
                    tabIndex={0}
                    aria-label={describe(it)}
                    // Con onMouseEnter + onClick a la vez, un tap disparaba los dos:
                    // el enter abría el tooltip y el click lo cerraba en el mismo gesto,
                    // de ahí que hicieran falta dos toques. Separado por tipo de puntero:
                    // el ratón usa hover, el dedo usa un tap que alterna.
                    onPointerEnter={e => { if (e.pointerType === 'mouse') setActiveKey(it.key); }}
                    onPointerLeave={e => { if (e.pointerType === 'mouse') setActiveKey(null); }}
                    onPointerDown={e => { if (e.pointerType !== 'mouse') setActiveKey(k => (k === it.key ? null : it.key)); }}
                    // Solo con teclado: al tocar, el foco llegaba después del
                    // pointerdown y reabría el tooltip que el toque acababa de cerrar.
                    onFocus={e => { if (e.currentTarget.matches(':focus-visible')) setActiveKey(it.key); }}
                    onBlur={() => setActiveKey(null)}
                  >
                    <circle cx={it.px} cy={LINE_Y} r={it.hit} fill="transparent" />
                    {it.isCluster && (
                      <circle cx={it.px} cy={LINE_Y} r={it.outer} className={it.hasToday ? 'tl-ring today' : 'tl-ring'} />
                    )}
                    <circle cx={it.px} cy={LINE_Y} r={it.r} className={it.hasToday ? 'tl-dot today' : 'tl-dot'} />
                    {(it.hasToday || it.count > 1) && it.r >= MIN_R_COUNT && (
                      <text x={it.px} y={LINE_Y + 3.2} textAnchor="middle" className="tl-count">{it.count}</text>
                    )}
                    {it.label && (
                      <text
                        x={it.labelX}
                        y={it.side === 'above' ? LABEL_ABOVE : LABEL_BELOW}
                        textAnchor="middle"
                        className={it.hasToday ? 'tl-label today' : 'tl-label'}
                      >
                        {it.text}
                      </text>
                    )}
                  </g>
                ))}
              </>
            )}
          </svg>
        )}

        {tip && (
          <div
            className="timeline-tip"
            // Debajo del marcador y no encima: hacia arriba solo hay ~30px hasta el
            // borde de la tarjeta y en móvil .stats-row lleva overflow:hidden, así que
            // el tooltip salía recortado. El centro se acota con el max-width del CSS
            // para que no se salga por los lados.
            style={{
              left: width < TIP_MAX + 16
                ? width / 2
                : Math.min(Math.max(tip.px, TIP_MAX / 2 + 8), width - TIP_MAX / 2 - 8),
              top: LINE_Y + tip.outer + 10,
            }}
          >
            {tipRows.rows.map(d => (
              <div key={d.offset} className="timeline-tip-day">
                <div className="timeline-tip-date">
                  {d.offset === 0 ? `Hoy · ${longDate(dateFor(d.offset))}` : longDate(dateFor(d.offset))}
                </div>
                {d.topics.map(t => <div key={t.id} className="timeline-tip-item">{t.name}</div>)}
              </div>
            ))}
            {tipRows.hidden > 0 && (
              <div className="timeline-tip-more">+{tipRows.hidden} tema{tipRows.hidden === 1 ? '' : 's'} más</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
