import { motion } from 'framer-motion';
import { content } from '../content';
import { EXPERIMENTS } from '../projects';
import { Eyebrow } from './Eyebrow';

// Planta B: sótano técnico. Hormigón, cuadrícula y fluorescentes que parpadean al llegar.
const FLICKER = { opacity: [0, 0.9, 0.1, 1, 0.3, 1] };

export function Lab({ active, reduced }: { active: boolean; reduced: boolean }) {
  return (
    <div className="absolute inset-0 overflow-y-auto bg-[#0a0e0d] text-[#b9c9c4]">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgb(201_255_240/0.045)_1px,transparent_1px),linear-gradient(90deg,rgb(201_255_240/0.045)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <span className="absolute right-[3vw] -bottom-[6vw] font-mono text-[30vw] leading-none font-bold text-transparent [-webkit-text-stroke:1px_rgb(201_255_240/0.1)]">
          −1
        </span>
        {/* Fluorescentes */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_60%_70%_at_50%_0%,rgb(201_255_240/0.12),transparent_70%)]"
          initial={reduced ? false : { opacity: 0 }}
          animate={active || reduced ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.2, delay: 0.5 }}
        />
        {[25, 75].map((left, i) => (
          <motion.div
            key={left}
            className="absolute top-2 h-1.5 w-[22vw] -translate-x-1/2 rounded-full bg-[#effffa] shadow-[0_0_24px_6px_rgb(201_255_240/0.35)]"
            style={{ left: `${left}%` }}
            initial={reduced ? false : { opacity: 0 }}
            animate={reduced ? { opacity: 1 } : active ? FLICKER : { opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.1 + i * 0.15, times: [0, 0.1, 0.2, 0.45, 0.6, 1] }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex min-h-full max-w-6xl flex-col justify-center px-6 pt-28 pb-32 sm:px-12 sm:pr-56">
        <Eyebrow floor="B" className="text-[#c9fff0]" />
        <h1
          id="floor-title"
          tabIndex={-1}
          className="mt-6 font-mono text-4xl font-light tracking-tight text-[#effffa] sm:text-6xl"
        >
          Laboratorio
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed">{content.lab.intro}</p>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERIMENTS.length === 0 && (
            <li className="rounded-sm border border-dashed border-[#c9fff0]/25 p-6 font-mono text-sm leading-relaxed">
              <p className="text-[11px] tracking-[0.25em] text-[#c9fff0]/70 uppercase">EXP-00</p>
              <p className="mt-3 text-[#effffa]">[Aún no hay experimentos]</p>
              <p className="mt-2 text-[#b9c9c4]/70">
                [Añade una carpeta en public/proyectos con "floor": "lab" en su project.json]
              </p>
            </li>
          )}
          {EXPERIMENTS.map((p, i) => (
            <li key={p.slug}>
              <a
                href={p.url}
                target="_blank"
                rel="noopener"
                className="group block h-full rounded-sm border border-[#c9fff0]/15 bg-[#0d1312] p-6 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <p className="font-mono text-[11px] tracking-[0.25em] text-[#c9fff0]/70 uppercase">
                  EXP-{String(i + 1).padStart(2, '0')}
                  {p.year ? ` · ${p.year}` : ''}
                </p>
                <p className="mt-3 text-lg text-[#effffa]">
                  {p.title} <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">↗</span>
                </p>
                {p.description && <p className="mt-2 text-sm leading-relaxed">{p.description}</p>}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
