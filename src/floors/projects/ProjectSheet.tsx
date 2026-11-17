import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { doorEase } from '../../motion';
import type { Project } from '../../projects';
import { Cover } from './Cover';

interface Props {
  project: Project;
  index: number;
  reduced: boolean;
  onClose: () => void;
}

// Ficha del proyecto: diálogo modal a la derecha, con el enlace a la demo en vivo.
export function ProjectSheet({ project, index, reduced, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => {
      if (d?.open) d.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="sheet-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-xl overflow-hidden border-l border-white/10 bg-[#111113] p-0 text-metal backdrop:bg-black/70"
    >
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, x: 48 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: reduced ? 0.2 : 0.5, ease: doorEase }}
        className="flex h-full flex-col overflow-y-auto p-6 sm:p-10"
      >
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] tracking-[0.3em] text-accent uppercase">
            Proyecto {String(index + 1).padStart(2, '0')}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 items-center gap-2 rounded-full px-3 font-mono text-[11px] tracking-[0.2em] uppercase hover:text-[#eef0f2]"
          >
            Cerrar <span aria-hidden>✕</span>
          </button>
        </div>

        <div className="mt-6 aspect-[16/10] overflow-hidden rounded-[2px] border border-white/10 bg-black">
          <Cover project={project} index={index} />
        </div>

        <h2 id="sheet-title" className="mt-8 text-3xl font-extralight tracking-tight text-[#eef0f2] sm:text-4xl">
          {project.title}
        </h2>
        {project.year && <p className="mt-2 font-mono text-xs tracking-[0.2em] text-metal/60">{project.year}</p>}
        {project.description && <p className="mt-6 text-lg leading-relaxed">{project.description}</p>}

        {project.tags.length > 0 && (
          <ul aria-label="Tecnologías" className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <li
                key={t}
                className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] tracking-[0.1em] text-metal/80"
              >
                {t}
              </li>
            ))}
          </ul>
        )}

        {project.how.length > 0 && (
          <section aria-labelledby="sheet-how" className="mt-10">
            <h3 id="sheet-how" className="font-mono text-[11px] tracking-[0.3em] text-accent uppercase">
              Cómo funciona
            </h3>
            <ol className="mt-4 space-y-3">
              {project.how.map((paso, i) => (
                <li key={i} className="flex gap-4 leading-relaxed">
                  <span aria-hidden className="mt-[3px] font-mono text-xs text-metal/50">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{paso}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {project.basics.length > 0 && (
          <section aria-labelledby="sheet-basics" className="mt-10">
            <h3 id="sheet-basics" className="font-mono text-[11px] tracking-[0.3em] text-accent uppercase">
              Bases del proyecto
            </h3>
            <ul className="mt-4 space-y-3">
              {project.basics.map((base, i) => (
                <li key={i} className="flex gap-4 leading-relaxed">
                  <span aria-hidden className="mt-[9px] h-px w-3 shrink-0 bg-accent/60" />
                  <span>{base}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-10 sm:flex-row sm:flex-wrap">
          <a
            href={project.url}
            target="_blank"
            rel="noopener"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 font-mono text-xs font-medium tracking-[0.15em] text-[#1a1206] uppercase transition-transform hover:-translate-y-px active:translate-y-0 active:scale-[0.98]"
          >
            Abrir proyecto <span aria-hidden>↗</span>
          </a>
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener"
              className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 font-mono text-xs tracking-[0.15em] uppercase transition-transform hover:text-[#eef0f2] active:scale-[0.98]"
            >
              Ver código <span aria-hidden>↗</span>
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 items-center justify-center rounded-full border border-white/15 px-6 font-mono text-xs tracking-[0.15em] uppercase transition-transform active:scale-[0.98]"
          >
            Volver al pasillo
          </button>
        </div>
      </motion.div>
    </dialog>
  );
}
