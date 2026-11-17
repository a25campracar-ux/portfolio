import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { corridorLerp } from '../../motion';
import type { Project } from '../../projects';
import { Cover } from './Cover';

interface Props {
  projects: Project[];
  /** Puertas abiertas y sin ficha encima: el pasillo responde a rueda, arrastre y teclas. */
  active: boolean;
  reduced: boolean;
  /** Índice desde el que empezar (al volver de una ficha). */
  startAt: number;
  onIndex: (i: number) => void;
  /** Para los botones de anterior/siguiente del HUD. */
  controlRef: React.RefObject<{ goTo: (i: number) => void; step: (d: number) => void } | null>;
}

function useViewport() {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const on = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return size;
}

// Medidas del pasillo en píxeles a partir del tamaño de la ventana.
function geometry(w: number, h: number) {
  const mobile = w < 700;
  const P = mobile ? 700 : 1000; // perspectiva
  const D0 = mobile ? 320 : 460; // distancia de la tarjeta activa a la cámara
  const S = mobile ? 600 : 720; // separación entre tarjetas
  const scale = P / (P + D0); // tamaño aparente de la tarjeta activa
  const visual = mobile ? Math.min(w * 0.84, 420) : Math.min(540, w * 0.38);
  const cardW = visual / scale;
  return {
    mobile,
    P,
    D0,
    S,
    scale,
    cardW,
    // El pasillo siempre es más ancho que la tarjeta, para que no atraviese las paredes.
    W: Math.max(w * 1.02, cardW * 1.4),
    H: h * 1.02,
    /** Ángulo de las tarjetas colgadas en la pared. */
    wallAngle: mobile ? 78 : 68,
  };
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function Corridor({ projects, active, reduced, startAt, onIndex, controlRef }: Props) {
  const { w, h } = useViewport();
  const g = useMemo(() => geometry(w, h), [w, h]);
  const n = projects.length;
  const last = Math.max(0, n - 1);

  const sceneRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const pos = useRef(startAt);
  const target = useRef(startAt);
  const nearest = useRef(startAt);
  const raf = useRef(0);
  const running = useRef(false);
  const lastT = useRef(0);
  const snapTimer = useRef<number | undefined>(undefined);

  // Las tarjetas cuelgan alternando pared derecha e izquierda.
  const sideOf = (i: number) => (i % 2 ? -1 : 1);
  const wallX = (g.W / 2) - (g.cardW / 2) * Math.cos((g.wallAngle * Math.PI) / 180) - 24;
  const zOf = (i: number) => -(i * g.S + g.D0);
  const length = n * g.S + g.D0 + g.S; // hasta la pared del fondo

  // Pinta la cámara y cada tarjeta. Solo transform y opacity.
  // La tarjeta de delante sale de la pared y gira hasta quedar de frente.
  const apply = useCallback(() => {
    const p = pos.current;
    if (worldRef.current) worldRef.current.style.transform = `translate3d(0, 0, ${p * g.S}px)`;
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const rel = i - p;
      const raw = rel < 0 ? 1 + rel * 2 : 1 - rel * 1.25;
      const t0 = clamp(raw, 0, 1);
      const t = t0 * t0 * (3 - 2 * t0); // smoothstep
      const side = sideOf(i);
      const x = side * wallX * (1 - t);
      const rot = -side * g.wallAngle * (1 - t);
      const o = rel < -0.5 ? 0 : rel < 0 ? 1 + rel / 0.5 : Math.max(0.25, 1 - rel * 0.18);
      el.style.transform = `translate3d(${x}px, ${-g.H * 0.03}px, ${zOf(i)}px) rotateY(${rot}deg) translate(-50%, -50%)`;
      el.style.opacity = o.toFixed(3);
      el.style.pointerEvents = o < 0.2 ? 'none' : 'auto';
    });
    const k = clamp(Math.round(p), 0, last);
    if (k !== nearest.current) {
      nearest.current = k;
      onIndex(k);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g, wallX, last, onIndex]);

  const tick = useCallback(
    (now: number) => {
      const dt = Math.min(0.05, (now - lastT.current) / 1000);
      lastT.current = now;
      const d = target.current - pos.current;
      if (Math.abs(d) < 0.0005 || reduced) {
        pos.current = target.current;
        apply();
        running.current = false;
        return;
      }
      // Lerp 0.08 por fotograma a 60 fps, igual a cualquier frecuencia de pantalla.
      pos.current += d * (1 - Math.pow(1 - corridorLerp, dt * 60));
      apply();
      raf.current = requestAnimationFrame(tick);
    },
    [apply, reduced],
  );

  const kick = useCallback(() => {
    if (running.current) return;
    running.current = true;
    lastT.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  }, [tick]);

  const goTo = useCallback(
    (i: number) => {
      target.current = clamp(i, 0, last);
      kick();
    },
    [kick, last],
  );
  const step = useCallback((d: number) => goTo(Math.round(target.current) + d), [goTo]);

  useLayoutEffect(() => {
    controlRef.current = { goTo, step };
  }, [controlRef, goTo, step]);

  useLayoutEffect(() => {
    apply();
  }, [apply]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // Rueda, arrastre y teclado: solo con el pasillo activo.
  useEffect(() => {
    const scene = sceneRef.current;
    if (!active || !scene) return;

    const snapSoon = () => {
      window.clearTimeout(snapTimer.current);
      snapTimer.current = window.setTimeout(() => goTo(Math.round(target.current)), 160);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const raw = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const d = raw * (e.deltaMode === 1 ? 40 : 1);
      target.current = clamp(target.current + d / 650, -0.15, last + 0.15);
      kick();
      snapSoon();
    };

    let drag: { x: number; y: number; start: number; moved: boolean } | null = null;
    let suppressClick = false;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, start: target.current, moved: false };
      suppressClick = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) > 6) drag.moved = true;
      if (!drag.moved) return;
      target.current = clamp(drag.start - (dx + dy) / (g.mobile ? 260 : 420), -0.2, last + 0.2);
      kick();
    };
    const onUp = () => {
      if (drag?.moved) {
        suppressClick = true;
        goTo(Math.round(target.current));
      }
      drag = null;
    };
    const onClickCapture = (e: MouseEvent) => {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const keys: Record<string, () => void> = {
        ArrowRight: () => step(1),
        ArrowDown: () => step(1),
        PageDown: () => step(1),
        ArrowLeft: () => step(-1),
        ArrowUp: () => step(-1),
        PageUp: () => step(-1),
        Home: () => goTo(0),
        End: () => goTo(last),
      };
      const fn = keys[e.key];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };

    scene.addEventListener('wheel', onWheel, { passive: false });
    scene.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    scene.addEventListener('click', onClickCapture, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(snapTimer.current);
      scene.removeEventListener('wheel', onWheel);
      scene.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      scene.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [active, g.mobile, goTo, kick, last, step]);

  // Planos del pasillo: van de detrás de la cámara hasta la pared del fondo.
  const planeLen = length + g.P;
  const zMid = (g.P - length) / 2;
  const place = (x: number, y: number, z: number, rot = '') =>
    `translate3d(${x}px, ${y}px, ${z}px) ${rot} translate(-50%, -50%)`;

  return (
    <div
      ref={sceneRef}
      className="absolute inset-0 touch-none overflow-hidden select-none"
      style={{ perspective: `${g.P}px`, perspectiveOrigin: '50% 48%' }}
    >
      <div
        ref={worldRef}
        className="corridor-world absolute top-1/2 left-1/2 h-0 w-0 will-change-transform [transform-style:preserve-3d]"
      >
        {/* Suelo, techo y paredes */}
        <div
          aria-hidden
          className="absolute bg-[#121214] bg-[linear-gradient(90deg,rgb(0_0_0/0.35),transparent_18%,transparent_82%,rgb(0_0_0/0.35)),repeating-linear-gradient(0deg,rgb(255_255_255/0.05)_0_2px,transparent_2px_180px)]"
          style={{ width: g.W, height: planeLen, transform: place(0, g.H / 2, zMid, 'rotateX(90deg)') }}
        />
        <div
          aria-hidden
          className="absolute bg-[#0d0d0f] bg-[repeating-linear-gradient(0deg,rgb(255_255_255/0.03)_0_1px,transparent_1px_300px)]"
          style={{ width: g.W, height: planeLen, transform: place(0, -g.H / 2, zMid, 'rotateX(-90deg)') }}
        />
        {[-1, 1].map((side) => (
          <div
            key={side}
            aria-hidden
            className="absolute bg-[#18181b] bg-[repeating-linear-gradient(90deg,rgb(0_0_0/0.55)_0_3px,transparent_3px_300px),linear-gradient(180deg,rgb(0_0_0/0.3),transparent_25%,transparent_80%,rgb(255_255_255/0.035)_80%_81%,rgb(0_0_0/0.25)_81%)]"
            style={{
              width: planeLen,
              height: g.H,
              transform: place((side * g.W) / 2, 0, zMid, `rotateY(${side * -90}deg)`),
            }}
          />
        ))}
        {/* Pared del fondo */}
        <div
          aria-hidden
          className="absolute grid place-items-center bg-[#0b0b0c] font-mono text-[28px] tracking-[0.4em] text-white/15 uppercase"
          style={{ width: g.W, height: g.H, transform: place(0, 0, -length) }}
        >
          Fin del pasillo
        </div>

        {/* Luz de cada tarjeta: tubo en el techo, charco en el suelo y reflejo en las paredes */}
        {projects.map((p, i) => (
          <Fragment key={`light-${p.slug}`}>
            <div
              aria-hidden
              className="absolute rounded-full bg-[#fff6e6] shadow-[0_0_40px_10px_rgb(255_241_214/0.35)]"
              style={{ width: g.cardW * 0.6, height: 14, transform: place(0, -g.H / 2 + 2, zOf(i) + 80, 'rotateX(90deg)') }}
            />
            <div
              aria-hidden
              className="absolute bg-[radial-gradient(closest-side,rgb(255_241_214/0.2),transparent)]"
              style={{ width: g.cardW * 1.6, height: g.S * 0.9, transform: place(0, g.H / 2 - 2, zOf(i) + g.S * 0.1, 'rotateX(90deg)') }}
            />
            {[sideOf(i)].map((side) => (
              <div
                key={side}
                aria-hidden
                className="absolute bg-[radial-gradient(ellipse_45%_70%_at_50%_10%,rgb(255_241_214/0.14),transparent)]"
                style={{
                  width: g.S,
                  height: g.H,
                  transform: place((side * g.W) / 2 - side * 2, 0, zOf(i), `rotateY(${side * -90}deg)`),
                }}
              />
            ))}
          </Fragment>
        ))}

        {/* Tarjetas */}
        {projects.map((p, i) => (
          <Link
            key={p.slug}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            to={`/projects/${p.slug}`}
            state={{ fromCorridor: true }}
            draggable={false}
            onFocus={() => goTo(i)}
            onClick={(e) => {
              // Con el ratón, una tarjeta lejana primero se acerca; la de delante abre la ficha.
              if (e.detail !== 0 && i !== nearest.current) {
                e.preventDefault();
                goTo(i);
              }
            }}
            aria-label={`${p.title}${p.year ? `, ${p.year}` : ''}. Ver ficha`}
            className="corridor-card group absolute block rounded-[2px] border border-white/10 bg-[#141416] p-[0.6em] shadow-[0_40px_80px_rgb(0_0_0/0.7)]"
            style={{
              width: g.cardW,
              fontSize: 16 / g.scale,
            }}
          >
            <div className="aspect-[16/10] overflow-hidden bg-black">
              <Cover project={p} index={i} />
            </div>
            <div className="flex items-baseline justify-between gap-4 px-[0.4em] pt-[0.9em] pb-[0.4em]">
              <div>
                <p className="font-mono text-[0.7em] tracking-[0.25em] text-accent uppercase">
                  {String(i + 1).padStart(2, '0')}
                  {p.year ? ` · ${p.year}` : ''}
                </p>
                <p className="mt-[0.3em] text-[1.35em] font-light text-[#eef0f2]">{p.title}</p>
              </div>
              <span className="shrink-0 font-mono text-[0.7em] tracking-[0.2em] text-metal/60 uppercase transition-colors group-hover:text-accent">
                Ver ficha →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Viñeta: oscurece los bordes para dar profundidad */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_70%_at_50%_48%,transparent_55%,rgb(0_0_0/0.65))]"
      />
    </div>
  );
}
