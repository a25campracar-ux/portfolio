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

        {/* Cuaderno de laboratorio: una entrada de bitácora por experimento */}
        <ol className="mt-14 space-y-16">
          {EXPERIMENTS.length === 0 && (
            <li className="border-t border-dashed border-[#c9fff0]/25 pt-6 font-mono text-sm">
              <p className="text-[11px] tracking-[0.25em] text-[#c9fff0]/70 uppercase">EXP-00</p>
              <p className="mt-3 text-[#effffa]">Aún no hay experimentos.</p>
            </li>
          )}
          {EXPERIMENTS.map((p, i) => (
            <li key={p.slug}>
              <article aria-labelledby={`exp-${p.slug}`} className="border-t border-[#c9fff0]/20 pt-5">
                <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] tracking-[0.25em] text-[#c9fff0]/70 uppercase">
                  <span>EXP-{String(i + 1).padStart(2, '0')}</span>
                  {p.year && <span>{p.year}</span>}
                  {p.estado && (
                    <span className="text-[#c9fff0]">
                      <span aria-hidden className="mr-2 inline-block size-1.5 bg-[#c9fff0] align-middle shadow-[0_0_8px_2px_rgb(201_255_240/0.5)]" />
                      {p.estado}
                    </span>
                  )}
                </p>

                <div className="mt-6 grid gap-10 md:grid-cols-[minmax(0,1fr)_15rem] md:gap-14">
                  <div>
                    <h2 id={`exp-${p.slug}`} className="font-mono text-3xl font-light tracking-tight text-[#effffa] sm:text-4xl">
                      {p.title}
                    </h2>
                    {p.description && <p className="mt-3 max-w-xl text-lg leading-relaxed">{p.description}</p>}

                    {/* Hipótesis / Experimento / Resultado, con renglones de cuaderno */}
                    {p.bitacora.length > 0 && (
                      <dl className="mt-8 max-w-2xl">
                        {p.bitacora.map((b) => (
                          <div
                            key={b.etiqueta}
                            className="grid gap-1 border-b border-dashed border-[#c9fff0]/15 py-4 sm:grid-cols-[8.5rem_1fr] sm:gap-6"
                          >
                            <dt className="font-mono text-[11px] tracking-[0.2em] text-[#c9fff0]/70 uppercase sm:pt-1">{b.etiqueta}</dt>
                            <dd className="leading-relaxed text-[#cfdcd8]">{b.texto}</dd>
                          </div>
                        ))}
                      </dl>
                    )}

                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs tracking-[0.15em] uppercase">
                      <a href={p.url} target="_blank" rel="noopener" className="border border-[#c9fff0]/40 px-4 py-3 text-[#effffa] hover:border-[#c9fff0] hover:bg-[#c9fff0]/5">
                        Probar <span aria-hidden>↗</span>
                      </a>
                      {p.repo && (
                        <a href={p.repo} target="_blank" rel="noopener" className="text-[#c9fff0]/80 underline decoration-[#c9fff0]/30 underline-offset-4 hover:text-[#effffa]">
                          Código <span aria-hidden>↗</span>
                        </a>
                      )}
                      {p.tags.length > 0 && <span className="normal-case tracking-normal text-[#b9c9c4]/60">{p.tags.join(' · ')}</span>}
                    </div>
                  </div>

                  {/* Muestra con marcas de esquina, y el sello de IA encima */}
                  <figure className="relative mx-auto w-full max-w-[15rem]">
                    {p.muestra && (
                      <div className="relative p-2">
                        <span aria-hidden className="absolute top-0 left-0 size-3 border-t border-l border-[#c9fff0]/50" />
                        <span aria-hidden className="absolute top-0 right-0 size-3 border-t border-r border-[#c9fff0]/50" />
                        <span aria-hidden className="absolute bottom-0 left-0 size-3 border-b border-l border-[#c9fff0]/50" />
                        <span aria-hidden className="absolute right-0 bottom-0 size-3 border-r border-b border-[#c9fff0]/50" />
                        <img src={p.muestra} alt={`Captura de ${p.title}`} loading="lazy" className="block w-full opacity-90" />
                      </div>
                    )}
                    {p.pie && <figcaption className="mt-2 font-mono text-[11px] text-[#b9c9c4]/70">{p.pie}</figcaption>}
                    {p.ia && (
                      <p className="absolute -top-4 -right-3 max-w-[11rem] -rotate-6 border-2 border-[#ffb347] bg-[#0a0e0d]/90 px-3 py-2 font-mono text-[10px] leading-snug text-[#ffcf8a] shadow-[0_6px_20px_rgb(0_0_0/0.5)]">
                        <strong className="block text-[12px] tracking-[0.2em] text-[#ffb347] uppercase">Código 100% IA</strong>
                        {p.ia}
                      </p>
                    )}
                  </figure>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
