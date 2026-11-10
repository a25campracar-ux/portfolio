import { motion } from 'framer-motion';
import { useState } from 'react';
import { content } from '../content';
import { Eyebrow } from './Eyebrow';

// Planta 3: azotea de noche. Cielo, estrellas, la ciudad al fondo y el pretil en primer plano.

// Generador con semilla: el cielo es siempre el mismo.
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

const rand = seeded(7);
const starLayer = (n: number) =>
  Array.from({ length: n }, () => {
    const x = (rand() * 100).toFixed(2);
    const y = (rand() * 62).toFixed(2);
    const a = (0.35 + rand() * 0.65).toFixed(2);
    return `${x}vw ${y}vh 0 ${rand() > 0.9 ? 1 : 0}px rgb(220 232 255 / ${a})`;
  }).join(',');
const STARS = [starLayer(60), starLayer(45), starLayer(30)];

interface Building {
  x: number;
  w: number;
  h: number;
  windows: { x: number; y: number; on: boolean; blink: boolean }[];
}
const city = (count: number, maxH: number, seed: number): Building[] => {
  const r = seeded(seed);
  const out: Building[] = [];
  let x = -20;
  for (let i = 0; i < count && x < 1460; i++) {
    const w = 40 + r() * 90;
    const h = 60 + r() * maxH;
    const windows = [];
    for (let wy = 14; wy < h - 10; wy += 16) {
      for (let wx = 8; wx < w - 8; wx += 12) {
        if (r() > 0.86) windows.push({ x: x + wx, y: 320 - h + wy, on: true, blink: r() > 0.93 });
      }
    }
    out.push({ x, w, h, windows });
    x += w + r() * 8;
  }
  return out;
};
const FAR = city(40, 150, 3);
const NEAR = city(30, 220, 11);

function Skyline({ reduced }: { reduced: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-x-0 bottom-14 h-[42vh] w-full"
    >
      {FAR.map((b) => (
        <rect key={`f${b.x}`} x={b.x} y={320 - b.h - 40} width={b.w} height={b.h + 40} fill="#0f1729" />
      ))}
      {NEAR.map((b) => (
        <g key={`n${b.x}`}>
          <rect x={b.x} y={320 - b.h} width={b.w} height={b.h} fill="#070b14" />
          {b.windows.map((w) =>
            w.blink && !reduced ? (
              <motion.rect
                key={`${w.x}-${w.y}`}
                x={w.x}
                y={w.y}
                width="4"
                height="6"
                fill="#ffcf8a"
                animate={{ opacity: [0.8, 0.8, 0.1, 0.8] }}
                transition={{ duration: 7 + (w.x % 5), repeat: Infinity, times: [0, 0.7, 0.75, 1] }}
              />
            ) : (
              <rect key={`${w.x}-${w.y}`} x={w.x} y={w.y} width="4" height="6" fill="#ffcf8a" opacity="0.7" />
            ),
          )}
        </g>
      ))}
    </svg>
  );
}

export function Contact({ reduced }: { reduced: boolean }) {
  const { contact } = content;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="absolute inset-0 overflow-y-auto bg-[linear-gradient(180deg,#04060d_0%,#0a1222_55%,#16223a_100%)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {STARS.map((s, i) => (
          <motion.div
            key={i}
            className="absolute top-0 left-0 size-px rounded-full"
            style={{ boxShadow: s }}
            animate={reduced ? undefined : { opacity: [1, 0.45, 1] }}
            transition={{ duration: 4 + i * 1.7, repeat: Infinity, ease: 'easeInOut', delay: i }}
          />
        ))}
        <div className="absolute top-[50%] right-[10%] size-14 rounded-full sm:top-[12%] sm:right-[14%] bg-[radial-gradient(circle_at_40%_40%,#f4f1e8,#cfd6e2)] shadow-[0_0_80px_20px_rgb(156_195_255/0.18)] sm:size-28" />
        <Skyline reduced={reduced} />
        {/* Pretil de la azotea */}
        <div className="absolute inset-x-0 bottom-0 h-14 border-t border-[#9cc3ff]/15 bg-[#05070c]" />
      </div>

      <div className="relative mx-auto flex min-h-full max-w-6xl flex-col px-6 pt-28 pb-[48vh] sm:px-12 sm:pr-56">
        <Eyebrow floor="3" className="text-[#9cc3ff]" />
        <h1
          id="floor-title"
          tabIndex={-1}
          className="mt-6 max-w-3xl text-4xl leading-[1.08] font-extralight tracking-tight text-[#eef3fb] sm:text-6xl"
        >
          {contact.headline}
        </h1>

        <div className="mt-10 flex flex-col items-start gap-5">
          <a
            href={`mailto:${contact.email}`}
            className="group relative text-2xl font-light break-all text-[#eef3fb] sm:text-4xl"
          >
            {contact.email}
            <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[#9cc3ff] transition-transform duration-300 group-hover:scale-x-100" />
          </a>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copy}
              className="h-11 rounded-full border border-[#9cc3ff]/30 px-5 font-mono text-[11px] tracking-[0.2em] text-[#cfe0ff] uppercase transition-transform active:scale-95"
            >
              {copied ? 'Copiado' : 'Copiar email'}
            </button>
            <ul className="flex flex-wrap gap-3">
              {contact.socials.map((s) => (
                <li key={s.label}>
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 items-center rounded-full px-4 font-mono text-[11px] tracking-[0.2em] text-[#cfe0ff]/80 uppercase hover:text-[#eef3fb]"
                    >
                      {s.label} ↗
                    </a>
                  ) : (
                    <span className="flex h-11 items-center px-4 font-mono text-[11px] tracking-[0.2em] text-[#cfe0ff]/40 uppercase">
                      [{s.label}]
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <p role="status" className="sr-only">
            {copied ? 'Email copiado' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
